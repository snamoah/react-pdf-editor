
import React from 'react';
import 'semantic-ui-css/semantic.min.css'

import { Menu, Container, Segment, Header, Icon, Button, Grid, Dropdown } from 'semantic-ui-react';
import { readAsPDF, readAsDataURL, readAsImage } from './utils/asyncReader';
import { save } from './utils/pdf';
import { PdfPage } from './PdfPage';
import { Image } from './Image';
import { ggID } from './utils/helpers';


interface State {
  pdfFile?: File;
    selectedPageIndex: number;
    pdfName: string;
    pages: any[];
    allObjects: AllObjects[];
    pagesScale: any[];
    pageDimensions: Dimensions[];
    saving: boolean;
    uploading: boolean;
}

class App extends React.Component {

  state: State = {
    pdfFile: undefined,
    selectedPageIndex: -1,
    pdfName: '',
    pages: [],
    allObjects: [],
    pagesScale: [],
    pageDimensions: [],
    saving: false,
    uploading: false,
  }

  onUploadPDF = async (e: React.ChangeEvent<HTMLInputElement>  & { dataTransfer?: DataTransfer }) => {
    this.setState({ uploading: true });
    const files: FileList | undefined =  e.target.files || (e.dataTransfer && e.dataTransfer.files);
    if (!files) return;
    
    const file = files[0];
    if (!file || file.type !== "application/pdf") return;

    this.setState({
      selectedPageIndex: -1
    });

    try {
      await this.addPDF(file);

      this.setState({
        selectedPageIndex: 0
      });
    } catch (e) {
      console.log(e);
    } finally {
      this.setState({ uploading: false })
    }
  }

  addPDF = async (file: File) => {
    try {
      const pdf = await readAsPDF(file);
      this.setState({
        pdfName: file.name,
        pdfFile: file,
        pages: Array(pdf.numPages)
          .fill(0)
          .map((_, i) => pdf.getPage(i + 1)),
        allObjects: Array(pdf.numPages).fill([]),
        pagesScale: Array(pdf.numPages).fill(1),
        pageDimensions: Array(pdf.numPages).fill({ width: 0, height: 0 }) 
      });
    } catch (e) {
      console.log("Failed to add pdf.");
      throw e;
    }
  }

  savePDF = async () => {
    const { pdfFile, saving, pages, allObjects, pdfName } = this.state;
    if (!pdfFile || saving || !pages.length) return;

    this.setState({ saving: true });
    
    try {
      await save(pdfFile, allObjects, pdfName);
    } catch (e) {
      console.log(e);
    } finally {
      this.setState({ saving: false });
    }
  }

  renderHiddenInputs = () => (
    <>
      <input
        type="file"
        name="pdf"
        id="pdf"
        accept="application/pdf"
        onChange={this.onUploadPDF}
        style={{ display: 'none' }} />
      { this.state.selectedPageIndex > -1 && (
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={this.onUploadImage} 
          /> 
        ) 
      }
    </>
  )

  onUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedPageIndex } = this.state;
    const file: File | null = e.target.files && e.target.files[0];
    if (file && selectedPageIndex >= 0) {
      this.addImage(file);
      e.currentTarget.value = '';
    }
  }

  addImage = async (file: File) => {
    const { allObjects, selectedPageIndex } = this.state;
    try {
      // get dataURL to prevent canvas from tainted
      const url = await readAsDataURL(file);
      const img = await readAsImage(url as any);
      const id = ggID();
      const { width, height } = img;
      const object: ImageObject = {
        id,
        type: "image",
        width,
        height,
        x: 0,
        y: 0,
        payload: img,
        file
      };
      this.setState({
        allObjects: allObjects.map((objects, pIndex) =>
          pIndex === selectedPageIndex ? [...objects, object] : objects
        )
      });
    } catch (e) {
      console.log(`Fail to add image.`, e);
    }
  }

  handleFileInput = (inputName: string) => () => {
    document.getElementById(inputName)?.click();
  }

  renderEmpty = () => (
    <Segment placeholder loading={this.state.uploading} style={{ height: '80vh' }}>
      <Header icon>
        <Icon name='file pdf outline' />
        Upload your PDF to start editing!
      </Header>
      <Button primary onClick={this.handleFileInput('pdf')}>Load PDF</Button>
    </Segment>
  );

  nextPage = () => {
    this.setState((prevState: State) => ({
      selectedPageIndex: prevState.selectedPageIndex + 1,
    }))
  }

  previousPage = () => { 
    this.setState((prevState: State) => ({
      selectedPageIndex: prevState.selectedPageIndex - 1,
    }))
  }

  updateObject = (id: number, pageIndex: number, payload: Partial<ImageObject>) => {
    const { allObjects } = this.state;
    let pageObjects = allObjects[pageIndex];
    const objectToUpdate = pageObjects[id];
    const newObject: ImageObject = { ...objectToUpdate, ...payload };
    pageObjects[id] = newObject;

    this.setState({
      allObjects: allObjects.map((objects, index) =>
        pageIndex === index ? pageObjects : objects
      )
    })
  }

  updatePageDimensions = (pageIndex: number, dimensions: { width: number, height: number }) => {
    this.setState({
      pageDimensions: this.state.pageDimensions.map((page, index) => 
        pageIndex === index ? dimensions : page
      )
    });
  }

  removeObject = (id: number, pageIndex: number) => {
    const { allObjects } = this.state;
    const pageObjects = allObjects[pageIndex];
    pageObjects.splice(id, 1);
    allObjects[pageIndex] = pageObjects;
    this.setState({ allObjects });
  }

  render() {
    const { allObjects, pdfName, pdfFile, pages, saving, selectedPageIndex, pageDimensions } = this.state;
    const isMultiplePages = pages.length > 1;
    const isLastPage = selectedPageIndex === pages.length - 1;
    const currentPage = pages[selectedPageIndex];
    const allObjectsForCurrentPage = allObjects[selectedPageIndex];
    const currentPageDimensions = pageDimensions[selectedPageIndex];
  
    return (
      <Container style={{ margin: 30 }}>
        {this.renderHiddenInputs()}
          <Menu pointing>
            <Menu.Item header>PDF Editor</Menu.Item>
            <Menu.Menu position="right">
              {pdfFile && (
                <>
                  <Dropdown 
                    item 
                    closeOnBlur
                    icon="edit outline" 
                    simple>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={this.handleFileInput('image')}>
                        Add Image
                      </Dropdown.Item>
                      <Dropdown.Item>Add Drawing</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Menu.Item
                    name={saving ? 'Saving...' : 'Save'}
                    disabled={saving}
                    onClick={this.savePDF} />
                </>
              )}
               <Menu.Item 
                    name="Upload new PDF"
                    onClick={this.handleFileInput('pdf')} />
              </Menu.Menu>
          </Menu>
        
        
        {!pdfFile ? this.renderEmpty() : (
          <Grid>
              <Grid.Row>
                <Grid.Column width={3} verticalAlign="middle">
                  {isMultiplePages && selectedPageIndex !== 0 && (
                    <Button circular icon="angle left" onClick={this.previousPage} />
                  )}
                </Grid.Column>
                <Grid.Column width={10}>
                  {currentPage && (
                      <Segment
                        style={{ position: 'relative' }}
                        compact
                        stacked={isMultiplePages && !isLastPage}
                      >
                        <PdfPage
                          updateDimensions={(dimensions) => this.updatePageDimensions(selectedPageIndex, dimensions)}
                          page={currentPage} />
                          {allObjectsForCurrentPage && allObjectsForCurrentPage.map((data, index) => {
                            if (data.type === 'image') {
                              return (
                                  <Image
                                    removeImage={() => this.removeObject(index, selectedPageIndex)}
                                    key={`${pdfName}-${index}`}
                                    pageWidth={currentPageDimensions.width}
                                    pageHeight={currentPageDimensions.height}
                                    updateImageObject={(image) => this.updateObject(index, selectedPageIndex, image)}
                                    {...data}  
                                  />
                              )
                            }

                            return null;
                          })}
                      </Segment>
                    )
                  }
                </Grid.Column>
                <Grid.Column width={3} verticalAlign="middle" textAlign="right">
                  {isMultiplePages && selectedPageIndex !== pages.length - 1 && (
                    <Button circular icon="angle right" onClick={this.nextPage}/>
                  )}
                </Grid.Column>
              </Grid.Row>
          </Grid>
        )}
      </Container>
    );

  }
}

export default App;
