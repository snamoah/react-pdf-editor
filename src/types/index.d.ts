type ObjectType = 'image' | 'text';

interface ImageObject {
  id: () => number;
  type: ObjectType;
  width: number;
  height: number;
  file: File;
  x: number;
  y: number;
  payload: HTMLImageElement;
}

type AllObjects = (ImageObject)[]

interface State {
  pdfFile?: File;
    selectedPageIndex: number;
    pdfName: string;
    pages: any[];
    allObjects: AllObjects[];
    pagesScale: any[];
    saving: boolean;
    uploading: boolean;
}