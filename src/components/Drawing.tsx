import React, { createRef, useEffect, useState } from 'react';
import { DragActions } from '../entities';
import { getMovePosition } from '../utils/helpers';

interface Props {
    pageWidth: number;
    pageHeight: number;
    removeDrawing: () => void;
    updateDrawingObject: (drawingObject: Partial<DrawingObject>) => void;
}

export const Drawing = ({ x, y, width, height, path, pageWidth, pageHeight, updateDrawingObject }: DrawingObject & Props) => {
    const svgRef = createRef<SVGSVGElement>();
    const [mouseDown, setMouseDown] = useState(false);
    const [positionTop, setPositionTop] = useState(y);
    const [positionLeft, setPositionLeft] = useState(x);
    const [operation, setOperation] = useState<DragActions>(DragActions.NO_MOVEMENT);

    useEffect(() => {
        const svg = svgRef.current;
        if (svg) {
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
        }
    }, [svgRef, width, height]);

    const handleMousedown = (event: React.MouseEvent<HTMLDivElement>) => {
        setMouseDown(true);
        setOperation(DragActions.MOVE);
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (mouseDown) {
            const { top, left } = getMovePosition(
                positionLeft,
                positionTop,
                event.movementX,
                event.movementY,
                width,
                height,
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
                width,
                height,
                pageWidth,
                pageHeight
            );
        
            updateDrawingObject({
                x: left,
                y: top,
            });
        }

        if (operation === DragActions.SCALE) {
            updateDrawingObject({
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

    return (
        <div
            onMouseDown={handleMousedown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseOut={handleMouseOut}
            style={{
                position: 'absolute',
                top: positionTop,
                left: positionLeft,
                width,
                height,
                cursor: 'move',
            }}
            >
            <div style={{ position: 'relative' }}>
                <svg
                    ref={svgRef}
                >
                    <path
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        stroke="black"
                        fill="none"
                        d={path}
                    />
                </svg>
            </div>
        </div>
    )
}