
import React from 'react';
import 'semantic-ui-css/semantic.min.css'

import { Menu, Container, Segment, Header, Icon, Button, Grid } from 'semantic-ui-react';
import { readAsPDF } from './utils/asyncReader';
import { save } from './utils/pdf';
import { PdfPage } from './PdfPage';

interface State {
  pdfFile?: File;
    selectedPageIndex: number;
    pdfName: string;
    pages: any[];
    allObjects: any[];
    pagesScale: any[];
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
        onChange={this.onUploadPDF}
        style={{ display: 'none' }} />
      <input
          type="file"
          id="image"
          name="image"
          style={{ display: 'none' }}
          onChange={this.onUploadImage} />
    </>
  )

  onUploadImage = () => {}

  handleFileInput = (inputName: string) => () => {
    document.getElementById(inputName)?.click();
  }

  renderEmpty = () => (
    <Segment placeholder loading={this.state.uploading}>
      <Header icon>
        <Icon name='file' />
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

  render() {
    const { pdfFile, pages, saving, selectedPageIndex } = this.state;
    const isMultiplePages = pages.length > 1;
    const currentPage = pages[selectedPageIndex];

    return (
      <Container style={{ margin: 30 }}>
        {this.renderHiddenInputs()}
          <Menu pointing>
            <Menu.Item header>PDF Editor</Menu.Item>
            <Menu.Menu position="right">
              <Menu.Item 
                name="Upload new PDF"
                onClick={this.handleFileInput('pdf')}
              />
              {pdfFile && (
                <Menu.Item
                  name={saving ? 'Saving...' : 'Save'}
                  disabled={saving}
                  onClick={this.savePDF} />
                )}
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
                        compact
                        stacked={isMultiplePages}
                      >
                        <PdfPage page={currentPage} />
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
