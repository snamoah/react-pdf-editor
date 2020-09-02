import React from 'react';
import { AttachmentTypes } from '../entities';
import { Image } from '../containers/Image';
import { Drawing } from '../containers/Drawing';
import { Text } from '../containers/Text';

interface Props {
  attachments: Attachment[];
  pdfName: string;
  pageDimensions: Dimensions;
  removeAttachment: (index: number) => void;
  updateAttachment: (index: number, attachment: Partial<Attachment>) => void;
}

export const Attachments: React.FC<Props> = ({
  attachments,
  pdfName,
  pageDimensions,
  removeAttachment,
  updateAttachment,
}) => {
  const handleAttachmentUpdate = (index: number) => (
    attachment: Partial<Attachment>
  ) => updateAttachment(index, attachment);

  return attachments ? (
    <>
      {attachments.length
        ? attachments.map((attachment, index) => {
            const key = `${pdfName}-${index}`;

            if (attachment.type === AttachmentTypes.IMAGE) {
              return (
                <Image
                  key={key}
                  pageWidth={pageDimensions.width}
                  pageHeight={pageDimensions.height}
                  removeImage={() => removeAttachment(index)}
                  updateImageAttachment={handleAttachmentUpdate(index)}
                  {...(attachment as ImageAttachment)}
                />
              );
            }

            if (attachment.type === AttachmentTypes.DRAWING) {
              return (
                <Drawing
                  key={key}
                  pageWidth={pageDimensions.width}
                  pageHeight={pageDimensions.height}
                  removeDrawing={() => removeAttachment(index)}
                  updateDrawingAttachment={handleAttachmentUpdate(index)}
                  {...(attachment as DrawingAttachment)}
                />
              );
            }

            if (attachment.type === AttachmentTypes.TEXT) {
              return (
                <Text
                  key={key}
                  pageWidth={pageDimensions.width}
                  pageHeight={pageDimensions.height}
                  updateTextAttachment={handleAttachmentUpdate(index)}
                  {...(attachment as TextAttachment)}
                />
              );
            }
            return null;
          })
        : null}
    </>
  ) : null;
};
