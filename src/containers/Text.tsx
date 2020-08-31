import React, { useState, useRef } from 'react';
import { Text as Component } from '../components/Text';
import { getMovePosition } from '../utils/helpers';
import { DragActions, TextMode } from '../entities';

interface Props {
  pageWidth: number;
  pageHeight: number;
  updateTextAttachment: (textObject: Partial<TextAttachment>) => void;
}

export const Text = ({
  x,
  y,
  text,
  width,
  height,
  lineHeight,
  size,
  fontFamily,
  pageHeight,
  pageWidth,
  updateTextAttachment,
}: TextAttachment & Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(text || '');
  const [mouseDown, setMouseDown] = useState(false);
  const [positionTop, setPositionTop] = useState(y);
  const [positionLeft, setPositionLeft] = useState(x);
  const [operation, setOperation] = useState<DragActions>(
    DragActions.NO_MOVEMENT
  );
  const [textMode, setTextMode] = useState<TextMode>(TextMode.COMMAND);

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

  const handleMousedown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (textMode !== TextMode.COMMAND) {
      return;
    }

    setMouseDown(true);
    setOperation(DragActions.MOVE);
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (textMode !== TextMode.COMMAND) {
      return;
    }

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

      updateTextAttachment({
        x: left,
        y: top,
      });
    }

    // if (operation === DragActions.SCALE) {
    //     updateTextObject({
    //         x: positionLeft,
    //         y: positionTop,
    //     });

    // }

    setOperation(DragActions.NO_MOVEMENT);
  };

  const handleMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
    if (operation === DragActions.MOVE) {
      handleMouseUp(event);
    }

    if (textMode === TextMode.INSERT) {
      setTextMode(TextMode.COMMAND);
      prepareTextAndUpdate();
    }
  };

  const prepareTextAndUpdate = () => {
    // Deselect any selection when returning to command mode
    document.getSelection()?.removeAllRanges();

    const lines = [content];
    updateTextAttachment({
      lines,
      text: content,
    });
  };

  const toggleEditMode = () => {
    const input = inputRef.current;
    const mode =
      textMode === TextMode.COMMAND ? TextMode.INSERT : TextMode.COMMAND;

    setTextMode(mode);

    if (input && mode === TextMode.INSERT) {
      input.focus();
      input.select();
    } else {
      prepareTextAndUpdate();
    }
  };

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setContent(value);
  };

  return (
    <Component
      text={content}
      width={width}
      height={height}
      mode={textMode}
      size={size}
      lineHeight={lineHeight}
      inputRef={inputRef}
      fontFamily={fontFamily}
      positionTop={positionTop}
      onChangeText={onChangeText}
      positionLeft={positionLeft}
      handleMouseUp={handleMouseUp}
      toggleEditMode={toggleEditMode}
      handleMouseOut={handleMouseOut}
      handleMouseDown={handleMousedown}
      handleMouseMove={handleMouseMove}
    />
  );
};
