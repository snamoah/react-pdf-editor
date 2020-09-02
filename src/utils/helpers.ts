interface Position {
  top: number;
  left: number;
}

export function ggID(): () => number {
  let id = 0;
  return function genId() {
    return id++;
  };
}

export const getMovePosition = (
  x: number,
  y: number,
  dragX: number,
  dragY: number,
  width: number,
  height: number,
  pageWidth: number,
  pageHeight: number
): Position => {
  const newPositionTop = y + dragY;
  const newPositionLeft = x + dragX;
  const newPositionRight = newPositionLeft + width;
  const newPositionBottom = newPositionTop + height;

  const top =
    newPositionTop < 0
      ? 0
      : newPositionBottom > pageHeight
      ? pageHeight - height
      : newPositionTop;
  const left =
    newPositionLeft < 0
      ? 0
      : newPositionRight > pageWidth
      ? pageWidth - width
      : newPositionLeft;

  return {
    top,
    left,
  };
};

export const normalize = (value: number): number =>
  parseFloat((value / 255).toFixed(1));
