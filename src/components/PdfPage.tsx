import React, { useState, useEffect, useRef } from 'react';

interface Props {
  page: any;
  updateDimensions: ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => void;
}

export const PdfPage = ({ page, updateDimensions }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const renderPage = async (p: Promise<any>) => {
      const _page = await p;
      if (_page) {
        const context = canvasRef.current?.getContext('2d');
        const viewport = _page.getViewport({ scale: 1 });
  
        setWidth(viewport.width);
        setHeight(viewport.height);
  
        if (context) {
          await _page.render({
            canvasContext: canvasRef.current?.getContext('2d'),
            viewport,
          }).promise;
  
          updateDimensions({ width: viewport.width, height: viewport.height });
        }
      }
    };

    renderPage(page);
  }, [page, width, height, updateDimensions]);

  return (
    <div>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
