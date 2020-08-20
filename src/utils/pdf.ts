import { readAsArrayBuffer } from './asyncReader';
import { fetchFont, getAsset } from './prepareAssets';
import { noop, normalize } from './helpers';

export async function save(pdfFile: File, objects: any[], name: string) {
  const PDFLib = await getAsset('PDFLib');
  const download = await getAsset('download');
  const makeTextPDF = await getAsset('makeTextPDF');
  let pdfDoc: { getPages: () => any[]; embedFont: (arg0: unknown) => any; embedJpg: (arg0: unknown) => any; embedPng: (arg0: unknown) => any; embedPdf: (arg0: any) => [any] | PromiseLike<[any]>; save: () => any; };

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
    const embedProcesses = pageObjects.map(async (object: Attachment) => {
      if (object.type === 'image') {
        let { file, x, y, width, height } = (object as ImageObject);
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
        let { x, y, text, lineHeight, size, fontFamily, width } = (object as TextObject);
        const pdfFont = await pdfDoc.embedFont(fontFamily);
        return () =>
          page.drawText(text, {
            maxWidth: width,
            font: pdfFont,
            size,
            lineHeight,
            x,
            y: pageHeight - size! - y,
          });
      } else if (object.type === 'drawing') {
        let { x, y, path, scale, stroke, strokeWidth } = (object as DrawingObject);
        const {
          pushGraphicsState,
          setLineCap,
          popGraphicsState,
          setLineJoin,
          LineCapStyle,
          LineJoinStyle,
          rgb,
        } = PDFLib;
        return () => {
          page.pushOperators(
            pushGraphicsState(),
            setLineCap(LineCapStyle.Round),
            setLineJoin(LineJoinStyle.Round)
          );
          
          const color = window.w3color(stroke!).toRgb();

          page.drawSvgPath(path, {
            borderColor: rgb(
              normalize(color.r), 
              normalize(color.g), 
              normalize(color.b),
            ),
            borderWidth: strokeWidth,
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