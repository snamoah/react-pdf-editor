import React, { useState, createRef, useEffect } from 'react';

const IMAGE_MAX_SIZE = 500;

interface Props {
    payload: any,
    width: number;
    height: number;
    file: any;
}

export const Image = ({ payload, width, height, file }: Props) => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const [scale, setScale] = useState(1);
    const [canvasWidth, setCanvasWidth] = useState(width);
    const [canvasHeight, setCanvasHeight] = useState(height);
    const [imageFile, setImageFile] = useState(file);

    const renderImage = (img: any) => {
        const currentRef = canvasRef.current && canvasRef.current.getContext('2d');

        if (currentRef) {
            currentRef.drawImage(img, 0, 0);

            if (width > IMAGE_MAX_SIZE) {
                const newScale = IMAGE_MAX_SIZE / width;
                setScale(newScale);
                setCanvasWidth(width * newScale);
            } 

            if (height > IMAGE_MAX_SIZE) {
                const newScale = IMAGE_MAX_SIZE / height; 
                setScale(newScale);
                setCanvasHeight(height * newScale);
            }

        }
    }

    useEffect(() => {
        renderImage(payload);
    }, []);

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