import React, { useState, createRef } from 'react';

interface Props {
    page: any;
}

export const PdfPage = ({ page }: Props) => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const [ width, setWidth ] = useState(500);
    const [ height, setHeight ] = useState(window.innerHeight);

    const renderPage = async (p: Promise<any>) => {
       const _page = await p;
       const context = canvasRef.current?.getContext('2d');
       const viewport = _page.getViewport({ scale: 1 });

       setWidth(viewport.width);
       setHeight(viewport.height);

       if (context) {
           await _page.render({
               canvasContext: canvasRef.current?.getContext('2d'),
               viewport 
           }).promise;
       }
    }

    renderPage(page);

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={width} 
                height={height} />
        </div>
    )
}