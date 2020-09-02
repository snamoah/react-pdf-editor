import React, { useState, createRef } from 'react';
import { readAsPDF, readAsDataURL, readAsImage } from '../utils/asyncReader';
import { ggID } from '../utils/helpers';
import { Pdf } from './usePdf';
import { AttachmentTypes } from '../entities';

type ActionEvent<T> = React.TouchEvent<T> | React.MouseEvent<T>;

export enum UploadTypes {
  PDF = 'pdf',
  IMAGE = 'image',
}

const handlers = {
  pdf: async (file: File) => {
    try {
      const pdf = await readAsPDF(file);
      return {
        file,
        name: file.name,
        pages: Array(pdf.numPages)
          .fill(0)
          .map((_, index) => pdf.getPage(index + 1)),
      } as Pdf;
    } catch (error) {
      console.log('Failed to load pdf', error);
      throw new Error('Failed to load PDF');
    }
  },
  image: async (file: File) => {
    try {
      const url = await readAsDataURL(file);
      const img = await readAsImage(url as string);
      const id = ggID();
      const { width, height } = img;

      const imageAttachemnt: ImageAttachment = {
        id,
        type: AttachmentTypes.IMAGE,
        width,
        height,
        x: 0,
        y: 0,
        img,
        file,
      };
      return imageAttachemnt;
    } catch (error) {
      console.log('Failed to load image', error);
      throw new Error('Failed to load image');
    }
  },
};

/**
 * @function useUploader
 *
 * @description This hook handles pdf and image uploads
 *
 * @
 * @param use UploadTypes
 */
export const useUploader = ({
  use,
  afterUploadPdf,
  afterUploadAttachment,
}: {
  use: UploadTypes;
  afterUploadPdf?: (upload: Pdf) => void;
  afterUploadAttachment?: (upload: Attachment) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = createRef<HTMLInputElement>();

  const onClick = (event: ActionEvent<HTMLInputElement>) => {
    event.currentTarget.value = '';
  };

  const handleClick = () => {
    const input = inputRef.current;

    if (input) {
      setIsUploading(true);
      input.click();
    }
  };

  const upload = async (
    event: React.ChangeEvent<HTMLInputElement> & { dataTransfer?: DataTransfer }
  ) => {
    if (!isUploading) {
      return;
    }

    const files: FileList | undefined =
      event.currentTarget.files ||
      (event.dataTransfer && event.dataTransfer.files);
    if (!files) {
      setIsUploading(false);
      return;
    }

    const file = files[0];

    const result = await handlers[use](file);

    if (use === UploadTypes.PDF && afterUploadPdf) {
      afterUploadPdf(result as Pdf);
    }

    if (use === UploadTypes.IMAGE && afterUploadAttachment) {
      console.log('===> was this also called');
      afterUploadAttachment(result as ImageAttachment);
    }
    setIsUploading(false);
    return;
  };

  return {
    upload,
    onClick,
    inputRef,
    isUploading,
    handleClick,
  };
};
