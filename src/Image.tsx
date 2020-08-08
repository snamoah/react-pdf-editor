import React, { useState, createRef, useEffect } from 'react';

const IMAGE_MAX_SIZE = 300;

export const Image = ({ payload, width, height, file }: ImageObject) => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const [scale, setScale] = useState(1);
    const [canvasWidth, setCanvasWidth] = useState(width);
    const [canvasHeight, setCanvasHeight] = useState(height);
    const [imageFile, setImageFile] = useState(file);

    const renderImage = (img: HTMLImageElement) => {
        const currentRef = canvasRef.current && canvasRef.current.getContext('2d');

        if (currentRef) {
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

            currentRef.drawImage(img, 0, 0, canvasWidth, canvasHeight);
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