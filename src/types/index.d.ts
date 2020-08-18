interface W3Color {
  toRgb: () => { r: number, b: number, g: number, a: number }
}

declare interface Window {
    w3color: (color: object | string, element?: HTMLElement) => W3Color;
}

type AttachmentType = 'image' | 'text' | 'drawing';

interface AttachmentBase {
  id: () => number;
  width: number;
  height: number;
  x: number;
  y: number;
  type: AttachmentType;
}
interface ImageObject extends AttachmentBase {
  file: File;
  payload: HTMLImageElement;
}

interface DrawingObject extends AttachmentBase {
  path?: string;
  stroke?: string;
  strokeWidth?: number;
}

interface Dimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Attachment = ImageObject | DrawingObject;

type AllObjects = Attachment[]

type DragEventListener<T> = (e: React.MouseEvent<T>) => void;