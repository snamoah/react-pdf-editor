import { getAsset } from "./prepareAssets";

export const readAsArrayBuffer = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  export const readAsImage = (src: Blob | string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      if (src instanceof Blob) {
        const url = window.URL.createObjectURL(src);
        img.src = url;
      } else {
        img.src = src;
      }
    });
  }
  
  export function readAsDataURL(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  export async function readAsPDF(file: File) {
    const pdfjsLib = await getAsset('pdfjsLib');
    // Safari possibly get webkitblobresource error 1 when using origin file blob
    const blob = new Blob([file]);
    const url = window.URL.createObjectURL(blob);
    return pdfjsLib.getDocument(url).promise;
  }