interface W3Color {
  toRgb: () => { r: number; b: number; g: number; a: number };
}

declare interface Window {
  w3color: (
    color: Record<string, unknown> | string,
    element?: HTMLElement
  ) => W3Color;
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
  scale?: number;
  stroke?: string;
  strokeWidth?: number;
}

interface TextObject extends AttachmentBase {
  text?: string;
  fontFamily?: string;
  size?: number;
  lineHeight?: number;
  lines?: string[];
}

interface Dimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Attachment = ImageObject | DrawingObject | TextObject;

type AllObjects = Attachment[];

type DragEventListener<T> = (e: React.MouseEvent<T>) => void;
