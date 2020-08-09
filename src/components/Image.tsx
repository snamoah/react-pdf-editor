import React, { useState, createRef, useEffect } from 'react';
import { DragActions } from '../entities';
import { getMovePosition } from '../utils/helpers';

const IMAGE_MAX_SIZE = 300;
const ADJUSTERS_DIMENSIONS = 20;

interface Props {
    pageWidth: number;
    pageHeight: number;
    removeImage: () => void;
    updateImageObject: (imageObject: Partial<ImageObject>) => void;
}

export const Image = ({ x, y, payload, width, height, pageWidth, pageHeight, updateImageObject }: ImageObject & Props) => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const [canvasWidth, setCanvasWidth] = useState(width);
    const [canvasHeight, setCanvasHeight] = useState(height);
    const [mouseDown, setMouseDown] = useState(false);
    const [positionTop, setPositionTop] = useState(y);
    const [positionLeft, setPositionLeft] = useState(x);
    const [direction, setDirection] = useState<string[]>([]);
    const [operation, setOperation] = useState<DragActions>(DragActions.NO_MOVEMENT);

    const renderImage = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        let scale = 1;
        if (canvasWidth > IMAGE_MAX_SIZE) {
            scale = IMAGE_MAX_SIZE / canvasWidth;
        } 

        if (canvasHeight > IMAGE_MAX_SIZE) {
            scale = Math.min(scale, IMAGE_MAX_SIZE / canvasHeight);
        }

        const newCanvasWidth = canvasWidth * scale;
        const newCanvasHeight = canvasHeight * scale;

        setCanvasWidth(newCanvasWidth);
        setCanvasHeight(newCanvasHeight);

        canvas.width = newCanvasWidth;
        canvas.height = newCanvasHeight;

        context.drawImage(payload, 0, 0, newCanvasWidth, newCanvasHeight);
        canvas.toBlob(blob => {
            updateImageObject({ 
                file: blob as File, 
                 width: newCanvasWidth,
                 height: newCanvasHeight,
            });
        });
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setMouseDown(true);
        setOperation(DragActions.MOVE);
        const directions = event.currentTarget.dataset.direction;
        if (directions) {
            setDirection(directions.split('-'));
            setOperation(DragActions.SCALE);
        }
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (mouseDown) {
            const { top, left } = getMovePosition(
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

        if (operation === DragActions.MOVE) {
            const { top, left } = getMovePosition(
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

        if (operation === DragActions.SCALE) {
            updateImageObject({
                x: positionLeft,
                y: positionTop,
            });

        }

        setOperation(DragActions.NO_MOVEMENT);
    }

    const handleMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
        if (operation === DragActions.MOVE) {
            handleMouseUp(event);
        }
    }

    const handleImageScale = (event: React.MouseEvent<HTMLDivElement>) => {
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
                setCanvasWidth(canvasWidth + event.movementX);
            }

            if (direction.includes('bottom')) {
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
            onMouseOut={handleMouseOut}
            style={{
                position: "absolute",
                top: positionTop,
                left: positionLeft,
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor:  'grey',
                width: canvasWidth + 2,
                height: canvasHeight + 2,
                cursor: 'move',
            }}
        >
            <div style={{ position: 'relative' }}>
                <canvas 
                    ref={canvasRef}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />
                <div
                    data-direction="top-left"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleImageScale}
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
                    onMouseMove={handleImageScale}
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
                    onMouseMove={handleImageScale} 
                    style={{
                        position: 'absolute',
                        cursor: 'nesw-resize',
                        left: 0,
                        bottom: ADJUSTERS_DIMENSIONS - 15,
                        width: ADJUSTERS_DIMENSIONS,
                        height: ADJUSTERS_DIMENSIONS,
                    }} />
                <div
                    data-direction="bottom-right"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleImageScale} 
                    style={{
                        position: 'absolute',
                        bottom: ADJUSTERS_DIMENSIONS - 15,
                        right:  ADJUSTERS_DIMENSIONS - 15,
                        width: ADJUSTERS_DIMENSIONS,
                        height: ADJUSTERS_DIMENSIONS,
                        cursor: 'nwse-resize'
                    }} />
            </div>
        </div>
    );
}
