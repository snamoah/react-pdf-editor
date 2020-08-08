import React from 'react';
import logo from './logo.svg';
import { Provider, defaultTheme, Header, Grid, View, Flex, Text, Button } from '@adobe/react-spectrum';
import { readAsPDF } from './utils/asyncReader';
import { save } from './utils/pdf';

class App extends React.Component {

  state: {
    pdfFile?: File;
    selectedPageIndex: number;
    pdfName: string;
    pages: any[];
    allObjects: any[];
    pagesScale: any[];
    saving: boolean;
  } = {
    pdfFile: undefined,
    selectedPageIndex: -1,
    pdfName: '',
    pages: [],
    allObjects: [],
    pagesScale: [],
    saving: false,
  }

  onUploadPDF = async (e: React.ChangeEvent<HTMLInputElement>  & { dataTransfer?: DataTransfer }) => {
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

  handleFileInput = (inputName: string) => () =>
    document.getElementById(inputName)?.click();

  render() {
    return (
      <Provider theme={defaultTheme} colorScheme="light">
        <Grid
          areas={['header header', 'body body']}
        >
          <View gridArea="header" padding="size-250" backgroundColor="static-white">
            <Flex direction="row">
              <View width="size-1000" alignSelf="center">
                <Text>PDF Editor</Text>
              </View>
              <Flex direction="row" alignItems="end" gap="size-100">
                <View backgroundColor="red-400">
                  <input
                    type="file"
                    name="pdf"
                    id="pdf"
                    onChange={this.onUploadPDF}
                    style={{ display: 'none' }} />
                  <Button variant="cta" onPress={this.handleFileInput('pdf')}>Upload File</Button>
                </View>
                <View>
                  <Button alignSelf="flex-end"  variant="cta" onPress={this.handleFileInput('image')}>Upload Image</Button>
                </View>
              </Flex>
            </Flex>
          </View>
          <View gridArea="body">

          </View>
        </Grid>
        <section>
        
        {/* <input
          type="file"
          id="image"
          name="image"
          className="hidden"
          onChange={onUploadImage} /> */}

        <button onClick={this.savePDF}>{this.state.saving ? 'Saving' : 'Save' }</button>
        </section>
      </Provider>
    );

  }
}

export default App;
