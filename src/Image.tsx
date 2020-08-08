import React, { useState, createRef, useEffect, useRef } from 'react';

const IMAGE_MAX_SIZE = 300;

interface Props {
    updateImageObject: (imageObject: Partial<ImageObject>) => void;
}

type CanvasRenderingContext2DWithBlob = CanvasRenderingContext2D & { toBlob: (callback: (blob: Blob) => void) => void };

export const Image = ({ payload, width, height, file, updateImageObject }: ImageObject & Props) => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const [scale, setScale] = useState(1);
    const [canvasWidth, setCanvasWidth] = useState(width);
    const [canvasHeight, setCanvasHeight] = useState(height);
    const [imageFile, setImageFile] = useState(file);

    
    const renderImage = (img: HTMLImageElement) => {
        const context = canvasRef.current && canvasRef.current.getContext('2d');
        if (context) {
            if (canvasWidth > IMAGE_MAX_SIZE) {
                const newScale = IMAGE_MAX_SIZE / canvasWidth;
                setScale(newScale);
                setCanvasWidth(canvasWidth * newScale);
            } 

            if (canvasHeight > IMAGE_MAX_SIZE) {
                const newScale = IMAGE_MAX_SIZE / height; 
                setScale(newScale);
                setCanvasHeight(canvasHeight * newScale);
            }

            context.drawImage(payload, 0, 0, canvasWidth, canvasHeight);

            canvasRef.current && canvasRef.current.toBlob(blob => {
                updateImageObject({ file: blob as File, width: canvasWidth, height: canvasHeight });
            });
        }
    }

    useEffect(() => {
        renderImage(payload);
    }, [scale]);

    return (
        <div>
            <canvas 
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
            />
        </div>
    )
}