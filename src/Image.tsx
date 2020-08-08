import React, { useState, createRef, useEffect } from 'react';

const IMAGE_MAX_SIZE = 300;
const PADDING = 25;


interface Props {
    pageWidth: number;
    pageHeight: number;
    removeImage: () => void;
    updateImageObject: (imageObject: Partial<ImageObject>) => void;
}

const getImagePositions = (x: number, y: number, dragX: number, dragY: number, width: number, height: number, pageWidth: number, pageHeight: number) => {
    const newPositionTop = y + dragY;
    const newPositionLeft = x + dragX;
    const newPositionRight = newPositionLeft + width;
    const newPositionBottom = newPositionTop + height;

    const top = newPositionTop < 0 
            ? 0 
            : newPositionBottom > pageHeight + PADDING
            ? pageHeight - height + PADDING
            : newPositionTop;
    const left = newPositionLeft < 0 
        ? 0 
        : newPositionRight > pageWidth + PADDING
        ? pageWidth - width + PADDING
        : newPositionLeft

    return {
        top,
        left,
    }
};

export const Image = ({ x, y, payload, width, height, pageWidth, pageHeight, updateImageObject }: ImageObject & Props) => {
    const divRef = createRef<HTMLDivElement>();
    const canvasRef = createRef<HTMLCanvasElement>();
    const [scale, setScale] = useState(1);
    const [canvasWidth, setCanvasWidth] = useState(width);
    const [canvasHeight, setCanvasHeight] = useState(height);
    const [mouseDown, setMouseDown] = useState(false);
    const [positionTop, setPositionTop] = useState(y);
    const [positionLeft, setPositionLeft] = useState(x);

    const renderImage = (img: HTMLImageElement) => {
        const context = canvasRef.current && canvasRef.current.getContext('2d');
        if (context) {
            let newCanvasWidth = canvasWidth;
            let newCanvasHeight = canvasHeight;

            if (canvasWidth > IMAGE_MAX_SIZE) {
                const newScale = IMAGE_MAX_SIZE / canvasWidth;
                setScale(newScale);
                newCanvasWidth = canvasWidth * newScale;
                setCanvasWidth(newCanvasWidth);
            } 

            if (canvasHeight > IMAGE_MAX_SIZE) {
                const newScale = IMAGE_MAX_SIZE / height; 
                setScale(newScale);
                newCanvasHeight = canvasHeight * newScale;
                setCanvasHeight(newCanvasHeight);
            }

            context.drawImage(payload, 0, 0, newCanvasWidth, newCanvasHeight);

            canvasRef.current && canvasRef.current.toBlob(blob => {
                console.log('===> blob is in', blob);
                updateImageObject({ file: blob as File, width: newCanvasWidth, height: newCanvasHeight });
            });
        }
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setMouseDown(true);
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        const div = divRef.current && divRef.current;

        if (div && mouseDown) {
            const { top, left } = getImagePositions(
                positionLeft,
                positionTop,
                event.movementX,
                event.movementY,
                canvasWidth,
                canvasHeight,
                pageWidth,
                pageHeight
            );

            setPositionTop(top);
            setPositionLeft(left);
        }      
    }

    const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setMouseDown(false);

        const { top, left } = getImagePositions(
            positionLeft,
            positionTop,
            event.movementX,
            event.movementY,
            canvasWidth,
            canvasHeight,
            pageWidth,
            pageHeight
        );
        updateImageObject({
            x: left,
            y: top,
        });
    }

    useEffect(() => {
        renderImage(payload);
    }, [payload, canvasWidth, canvasHeight]);

    return (
        <div
            ref={divRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseOut={handleMouseUp}
            style={{
                position: "absolute",
                top: positionTop,
                left: positionLeft,
                borderStyle: "dashed",
                borderWidth: '1px',
                borderColor:  'grey',
                width: canvasWidth,
                height: canvasHeight,
            }}
        >
            <canvas 
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
            />
        </div>
    )
}
