import React, { RefObject } from 'react';
import { Dimmer } from 'semantic-ui-react';
import { Div } from '../ui/components/Div';
import { ConfirmContent } from './ConfirmContent';

const ADJUSTERS_DIMENSIONS = 20;

interface Props {
  dimmerActive: boolean;
  cancelDelete: () => void;
  deleteImage: () => void;
  width: number;
  height: number;
  canvasRef: RefObject<HTMLCanvasElement>;
  positionTop: number;
  positionLeft: number;
  onClick: DragEventListener<HTMLDivElement>;
  handleMouseOut: DragEventListener<HTMLDivElement>;
  handleMouseDown: DragEventListener<HTMLDivElement>;
  handleMouseMove: DragEventListener<HTMLDivElement>;
  handleMouseUp: DragEventListener<HTMLDivElement>;
  handleImageScale: DragEventListener<HTMLDivElement>;
}

export const Image: React.FC<Props> = ({
  canvasRef,
  positionTop,
  positionLeft,
  width,
  height,
  handleMouseOut,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleImageScale,
  dimmerActive,
  cancelDelete,
  deleteImage,
  onClick,
}) => {
  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseOut}
      onDoubleClick={onClick}
      style={{
        position: 'absolute',
        top: positionTop,
        left: positionLeft,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'grey',
        width: width + 2,
        height: height + 2,
        cursor: 'move',
      }}
    >
      <Dimmer.Dimmable as={Div} size="medium" dimmed={dimmerActive}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        <Dimmer active={dimmerActive} onClickOutside={cancelDelete}>
          <ConfirmContent
            title="Delete?"
            onConfirm={deleteImage}
            onDismiss={cancelDelete}
          />
        </Dimmer>
      </Dimmer.Dimmable>
      <div
        data-direction="top-left"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleImageScale}
        style={{
          position: 'absolute',
          cursor: 'nwse-resize',
          top: -5,
          left: -5,
          width: ADJUSTERS_DIMENSIONS,
          height: ADJUSTERS_DIMENSIONS,
        }}
      />
    </div>
  );
};
