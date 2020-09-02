import React, { createRef, useEffect, useState } from 'react';
import { DragActions } from '../entities';
import { getMovePosition } from '../utils/helpers';
import { Drawing as DrawingComponent } from '../components/Drawing';

interface Props {
  pageWidth: number;
  pageHeight: number;
  removeDrawing: () => void;
  updateDrawingAttachment: (drawingObject: Partial<DrawingAttachment>) => void;
}

export const Drawing = ({
  x,
  y,
  width,
  height,
  stroke,
  strokeWidth,
  path,
  pageWidth,
  pageHeight,
  removeDrawing,
  updateDrawingAttachment,
}: DrawingAttachment & Props) => {
  const svgRef = createRef<SVGSVGElement>();
  const [mouseDown, setMouseDown] = useState(false);
  const [positionTop, setPositionTop] = useState(y);
  const [positionLeft, setPositionLeft] = useState(x);
  const [operation, setOperation] = useState<DragActions>(
    DragActions.NO_MOVEMENT
  );
  const [dimmerActive, setDimmerActive] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
  }, [svgRef, width, height]);

  const handleMousedown = (event: React.MouseEvent<HTMLDivElement>) => {
    setMouseDown(true);
    setOperation(DragActions.MOVE);
  };

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
  };

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

      updateDrawingAttachment({
        x: left,
        y: top,
      });
    }

    if (operation === DragActions.SCALE) {
      updateDrawingAttachment({
        x: positionLeft,
        y: positionTop,
      });
    }

    setOperation(DragActions.NO_MOVEMENT);
  };

  const handleMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
    if (operation === DragActions.MOVE) {
      handleMouseUp(event);
    }
  };

  const handleClick = () => setDimmerActive(true);
  const cancelDelete = () => setDimmerActive(false);

  const confirmDelete = () => {
    cancelDelete();
    removeDrawing();
  };
  return (
    <DrawingComponent
      stroke={stroke}
      strokeWidth={strokeWidth}
      path={path}
      width={width}
      svgRef={svgRef}
      height={height}
      onClick={handleClick}
      cancelDelete={cancelDelete}
      dimmerActive={dimmerActive}
      deleteDrawing={confirmDelete}
      handleMouseDown={handleMousedown}
      handleMouseMove={handleMouseMove}
      handleMouseOut={handleMouseOut}
      handleMouseUp={handleMouseUp}
      positionLeft={positionLeft}
      positionTop={positionTop}
    />
  );
};
