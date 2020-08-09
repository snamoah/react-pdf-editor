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
}

interface Dimensions {
  width: number;
  height: number;
}

type Attachment = ImageObject | DrawingObject;

type AllObjects = Attachment[]
