import { useState, useMemo, useEffect, useCallback } from 'react';

export const useAttachments = () => {
  const [pageIndex, setPageIndex] = useState(-1);
  const [allPageAttachments, setAllPageAttachments] = useState<Attachments[]>(
    []
  );
  const [pageAttachments, setPageAttachments] = useState<Attachments>([]);

  useEffect(() => {
    const pageAttachmentToSet = allPageAttachments[pageIndex];

    setPageAttachments(pageAttachmentToSet);
    console.log('===> inside useEffect', pageIndex, pageAttachmentToSet);
  }, [pageIndex, allPageAttachments]);

  const add = (newAttachment: Attachment) => {
    console.log('===> pageIndex', pageIndex);
    if (pageIndex === -1) {
      return;
    }

    console.log('===> shefu', newAttachment);
    setAllPageAttachments(
      allPageAttachments.map((attachments, index) =>
        pageIndex === index ? [...attachments, newAttachment] : attachments
      )
    );

    console.log('===> attachemnts', allPageAttachments);
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

      console.log(
        '====> this is the root of all the evil',
        pageAttachments,
        allPageAttachments
      );
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
      console.log('===> reset attachment');
    },
    [setAllPageAttachments]
  );

  console.log(pageIndex, pageAttachments, allPageAttachments);
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
