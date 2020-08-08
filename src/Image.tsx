import React, { useState, createRef, useEffect } from 'react';

const IMAGE_MAX_SIZE = 300;
const PADDING = 25;
const ADJUSTERS_DIMENSIONS = 20;

interface Props {
    pageWidth: number;
    pageHeight: number;
    removeImage: () => void;
    updateImageObject: (imageObject: Partial<ImageObject>) => void;
}

const getImageMovePosition = (x: number, y: number, dragX: number, dragY: number, width: number, height: number, pageWidth: number, pageHeight: number) => {
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
    const canvasRef = createRef<HTMLCanvasElement>();
    const [canvasWidth, setCanvasWidth] = useState(width);
    const [canvasHeight, setCanvasHeight] = useState(height);
    const [mouseDown, setMouseDown] = useState(false);
    const [positionTop, setPositionTop] = useState(y);
    const [positionLeft, setPositionLeft] = useState(x);
    const [direction, setDirection] = useState<string[]>([]);

    const renderImage = (img: HTMLImageElement) => {
        const context = canvasRef.current && canvasRef.current.getContext('2d');
        if (context) {
            let newCanvasWidth = canvasWidth;
            let newCanvasHeight = canvasHeight;

            if (canvasWidth > IMAGE_MAX_SIZE) {
                const newScale = IMAGE_MAX_SIZE / canvasWidth;
                newCanvasWidth = canvasWidth * newScale;
                setCanvasWidth(newCanvasWidth);
            } 

            if (canvasHeight > IMAGE_MAX_SIZE) {
                const newScale = IMAGE_MAX_SIZE / height;
                newCanvasHeight = canvasHeight * newScale;
                setCanvasHeight(newCanvasHeight);
            }

            context.drawImage(payload, 0, 0, newCanvasWidth, newCanvasHeight);

            canvasRef.current && canvasRef.current.toBlob(blob => {
                updateImageObject({ file: blob as File, width: newCanvasWidth, height: newCanvasHeight });
            });
        }
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setMouseDown(true);
        const directions = event.currentTarget.dataset.direction;
        if (directions) {
            setDirection(directions.split('-'));
        }
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (mouseDown) {
            const { top, left } = getImageMovePosition(
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

        const { top, left } = getImageMovePosition(
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
            width: canvasWidth,
            height: canvasHeight,
        });
    }

    const handleScale = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (mouseDown) {
            if (direction.includes('left')) {
                setPositionLeft(positionLeft + event.movementX);
                setCanvasWidth(canvasWidth - event.movementX);
            }

            if (direction.includes('top')) {
                setPositionTop(positionTop + event.movementY);
                setCanvasHeight(canvasHeight - event.movementY);
            }

            if (direction.includes('right')) {
                setPositionLeft(positionLeft - event.movementX);
                setCanvasWidth(canvasWidth + event.movementX);
            }

            if (direction.includes('bottom')) {
                setPositionTop(positionTop - event.movementY);
                setCanvasHeight(canvasHeight + event.movementY);
            }
        }
    }

    useEffect(() => {
        renderImage(payload);
    }, [payload, canvasWidth, canvasHeight]);

    return (
        <div
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
                width: canvasWidth + 2,
                height: canvasHeight +  2,
                cursor: 'move',
            }}
        >
            <div style={{ position: 'relative' }}>
                <canvas 
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                />
                <div
                    data-direction="top-left"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleScale}
                    style={{
                        position: 'absolute',
                        cursor: 'nwse-resize',
                        top: 0,
                        left: 0,
                        width: ADJUSTERS_DIMENSIONS,
                        height: ADJUSTERS_DIMENSIONS,
                    }} />
                <div
                    data-direction="top-right"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleScale}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        cursor: 'nesw-resize',
                        width: ADJUSTERS_DIMENSIONS,
                        height: ADJUSTERS_DIMENSIONS,
                    }} />
                <div
                    data-direction="bottom-left"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleScale} 
                    style={{
                        position: 'absolute',
                        cursor: 'nesw-resize',
                        left: 0,
                        bottom: Math.round(ADJUSTERS_DIMENSIONS / 2),
                        width: ADJUSTERS_DIMENSIONS,
                        height: ADJUSTERS_DIMENSIONS,
                    }} />
                <div
                    data-direction="bottom-right"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleScale} 
                    style={{
                        position: 'absolute',
                        bottom: Math.round(ADJUSTERS_DIMENSIONS / 2),
                        right: 0,
                        width: ADJUSTERS_DIMENSIONS,
                        height: ADJUSTERS_DIMENSIONS,
                        cursor: 'nwse-resize'
                    }} />
            </div>
        </div>
    );
}
