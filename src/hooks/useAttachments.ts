import { useState, useEffect, useCallback } from 'react';

export const useAttachments = () => {
  const [pageIndex, setPageIndex] = useState(-1);
  const [allPageAttachments, setAllPageAttachments] = useState<Attachments[]>(
    []
  );
  const [pageAttachments, setPageAttachments] = useState<Attachments>([]);

  useEffect(() => {
    const pageAttachmentToSet = allPageAttachments[pageIndex];

    setPageAttachments(pageAttachmentToSet);
  }, [pageIndex, allPageAttachments]);

  const add = (newAttachment: Attachment) => {
    if (pageIndex === -1) {
      return;
    }

    setAllPageAttachments(
      allPageAttachments.map((attachments, index) =>
        pageIndex === index ? [...attachments, newAttachment] : attachments
      )
    );
  };

  const remove = useCallback(
    (attachmentIndex: number) => {
      if (pageIndex === -1) {
        return;
      }

      setAllPageAttachments(
        allPageAttachments.map((otherPageAttachments, index) =>
          pageIndex === index
            ? pageAttachments.filter(
                (_, _attachmentIndex) => _attachmentIndex !== attachmentIndex
              )
            : otherPageAttachments
        )
      );
    },
    [setAllPageAttachments]
  );

  const update = useCallback(
    (attachmentIndex: number, attachment: Partial<Attachment>) => {
      if (pageIndex === -1) {
        return;
      }

      setAllPageAttachments(
        allPageAttachments.map((otherPageAttachments, index) =>
          pageIndex === index
            ? pageAttachments.map((oldAttachment, _attachmentIndex) =>
                _attachmentIndex === attachmentIndex
                  ? { ...oldAttachment, ...attachment }
                  : oldAttachment
              )
            : otherPageAttachments
        )
      );
    },
    [setAllPageAttachments]
  );

  const reset = useCallback(
    (numberOfPages: number) => {
      setAllPageAttachments(Array(numberOfPages).fill([]));
    },
    [setAllPageAttachments]
  );

  return {
    add,
    reset,
    remove,
    update,
    setPageIndex,
    pageAttachments,
    allPageAttachments,
    setAllPageAttachments,
  };
};
