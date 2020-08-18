
import React, { RefObject } from 'react';
import 'semantic-ui-css/semantic.min.css'

import { Menu, Container, Segment, Header, Icon, Button, Grid, Dropdown } from 'semantic-ui-react';
import { readAsPDF, readAsDataURL, readAsImage } from './utils/asyncReader';
import { save } from './utils/pdf';
import { PdfPage } from './components/PdfPage';
import { Image } from './containers/Image';
import { ggID } from './utils/helpers';
import { DrawingModal } from './components/DrawingModal';
import { Drawing } from './containers/Drawing';
import { HelpModal } from './components/HelpModal';


interface State {
  pdfFile?: File;
    selectedPageIndex: number;
    pdfName: string;
    pages: any[];
    allObjects: AllObjects[];
    pagesScale: any[];
    pageDimensions: Dimensions[];
    saving: boolean;
    drawing: boolean;
    uploading: boolean;
    selectedDrawing: number;
    helpModalOpen: boolean;
}

class App extends React.Component {
  pdfInput: RefObject<HTMLInputElement>;
  imageInput: RefObject<HTMLInputElement>;

  state: State = {
    pdfFile: undefined,
    selectedPageIndex: -1,
    pdfName: '',
    pages: [],
    allObjects: [],
    pagesScale: [],
    pageDimensions: [],
    saving: false,
    drawing: false,
    uploading: false,
    selectedDrawing: 0,
    helpModalOpen: false,
  }

  constructor() {
    super({});

    this.pdfInput = React.createRef<HTMLInputElement>();
    this.imageInput = React.createRef<HTMLInputElement>();
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

  clearInput = (event: React.MouseEvent<HTMLInputElement>) => {
    event.currentTarget.value = '';
  }

  renderHiddenInputs = () => (
    <>
      <input
        ref={this.pdfInput}
        type="file"
        name="pdf"
        id="pdf"
        accept="application/pdf"
        onChange={this.onUploadPDF}
        onClick={this.clearInput}
        style={{ display: 'none' }} />
      { this.state.selectedPageIndex > -1 && (
          <input
            ref={this.imageInput}
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onClick={this.clearInput}
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
    const input = inputName === 'pdf' 
    ? this.pdfInput.current
    : inputName === 'image'
    ? this.imageInput.current
    : null;

    if (input) {
      input.click();
    }
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
    const newObject: Attachment = { ...objectToUpdate, ...(payload as Attachment)};
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

  openDrawingModal = () => {
    this.setState({
      drawing: true
    });
  }

  closeDrawingModal = () => {
    this.setState({
      drawing: false
    })
  }

  addDrawing = (pageIndex: number, drawing?: { width: number, height: number, path: string }) => {
    const { allObjects } = this.state;
    if (!drawing) return;

    const newObject: DrawingObject = {
      id: ggID(),
      type: 'drawing',
      ...drawing,
      x: 0,
      y: 0,
    }

    this.setState({
      allObjects: allObjects.map((objects, index) =>
        pageIndex === index ? [...objects, newObject] : objects
      )
    })
  }

  addText = () => {
    const { allObjects, selectedPageIndex } = this.state;

    const newObject: TextObject = {
      id: ggID(),
      type: 'text',
      x: 0,
      y: 0,
      width: 100,
      height: 25,
      text: 'Enter Text Here',
    };

    this.setState({
      allObjects: allObjects.map((objects, index) =>
        selectedPageIndex === index ? [...objects, newObject] : objects
      )
    })    
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
                    <Dropdown.Item
                        onClick={this.addText}>
                          Add Text
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={this.handleFileInput('image')}
                      >
                        Add Image
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={this.openDrawingModal}
                      >
                        Add Drawing
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Menu.Item
                    name={saving ? 'Saving...' : 'Save'}
                    disabled={saving}
                    onClick={this.savePDF} 
                  />
                  <Menu.Item 
                    name="Upload New"
                    onClick={this.handleFileInput('pdf')} 
                  />
                </>
              )}
              <Menu.Item onClick={() => this.setState({ helpModalOpen: true })}>
                <Icon name="question circle outline" />
              </Menu.Item>
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
                            const key = `${pdfName}-${index}`;
                            if (data.type === 'image') {
                              return (
                                  <Image
                                    removeImage={() => this.removeObject(index, selectedPageIndex)}
                                    key={key}
                                    pageWidth={currentPageDimensions.width}
                                    pageHeight={currentPageDimensions.height}
                                    updateImageObject={(image) => this.updateObject(index, selectedPageIndex, image)}
                                    {...(data as ImageObject)}  
                                  />
                              )
                            }

                            if (data.type === 'drawing') {
                              return (
                                <Drawing
                                  key={key}
                                  removeDrawing={() => this.removeObject(index, selectedPageIndex)}
                                  pageWidth={currentPageDimensions.width}
                                  pageHeight={currentPageDimensions.height}
                                  updateDrawingObject={(drawing) => this.updateObject(index, selectedPageIndex, drawing)}
                                  {...data as DrawingObject}
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

        {
          <DrawingModal 
            open={this.state.drawing} 
            dismiss={this.closeDrawingModal}
            confirm={(drawingAttachment) => this.addDrawing(selectedPageIndex, drawingAttachment)}
          />
        }

        {<HelpModal 
          open={this.state.helpModalOpen}
          dismiss={() => this.setState({ helpModalOpen: false })}
           />}
      </Container>
    );

  }
}

export default App;
