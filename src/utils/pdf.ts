import { readAsArrayBuffer } from './asyncReader';
import { fetchFont, getAsset } from './prepareAssets';
import { noop } from './helpers';

export async function save(pdfFile: File, objects: any[], name: string) {
  const PDFLib = await getAsset('PDFLib');
  const download = await getAsset('download');
  const makeTextPDF = await getAsset('makeTextPDF');
  let pdfDoc: { getPages: () => any[]; embedJpg: (arg0: unknown) => any; embedPng: (arg0: unknown) => any; embedPdf: (arg0: any) => [any] | PromiseLike<[any]>; save: () => any; };

  try {
    pdfDoc = await PDFLib.PDFDocument.load(await readAsArrayBuffer(pdfFile));
  } catch (e) {
    console.log('Failed to load PDF.');
    throw e;
  }

  const pagesProcesses = pdfDoc.getPages().map(async (page, pageIndex) => {
    const pageObjects = objects[pageIndex];
    // 'y' starts from bottom in PDFLib, use this to calculate y
    const pageHeight = page.getHeight();
    const pageWidth = page.getWidth();
    const embedProcesses = pageObjects.map(async (object: { type?: any; file?: any; x?: any; y?: any; width?: any; height?: any; lines?: any; lineHeight?: any; size?: any; fontFamily?: any; path?: any; scale?: any; }) => {
      if (object.type === 'image') {
        let { file, x, y, width, height } = object;
        let img: any;
        try {
          if (file.type === 'image/jpeg') {
            img = await pdfDoc.embedJpg(await readAsArrayBuffer(file));
          } else {
            img = await pdfDoc.embedPng(await readAsArrayBuffer(file));
          }
          return () =>
            page.drawImage(img, {
              x,
              y: pageHeight - y - height,
              width,
              height,
            });
        } catch (e) {
          console.log('Failed to embed image.', e);
          return noop;
        }
      } else if (object.type === 'text') {
        let { x, y, lines, lineHeight, size, fontFamily } = object;
        const font = await fetchFont(fontFamily);
        const [textPage] = await pdfDoc.embedPdf(
          await makeTextPDF({
            lines,
            fontSize: size,
            lineHeight,
            width: pageWidth,
            height: pageHeight,
            font: font?.buffer || fontFamily, // built-in font family
            dy: font && font.correction && font.correction(size as number, lineHeight as number),
          })
        );
        return () =>
          page.drawPage(textPage, {
            width: pageWidth,
            height: pageHeight,
            x,
            y: -y,
          });
      } else if (object.type === 'drawing') {
        let { x, y, path, scale } = object;
        const {
          pushGraphicsState,
          setLineCap,
          popGraphicsState,
          setLineJoin,
          LineCapStyle,
          LineJoinStyle,
        } = PDFLib;
        return () => {
          page.pushOperators(
            pushGraphicsState(),
            setLineCap(LineCapStyle.Round),
            setLineJoin(LineJoinStyle.Round)
          );
          page.drawSvgPath(path, {
            borderWidth: 5,
            scale,
            x,
            y: pageHeight - y,
          });
          page.pushOperators(popGraphicsState());
        };
      }
    });
    // embed objects in order
    const drawProcesses: any[] = await Promise.all(embedProcesses);
    drawProcesses.forEach((p) => p());
  });
  await Promise.all(pagesProcesses);
  try {
    const pdfBytes = await pdfDoc.save();
    download(pdfBytes, name, 'application/pdf');
  } catch (e) {
    console.log('Failed to save PDF.');
    throw e;
  }
}