import React, { useState, createRef, useEffect } from 'react';
import { Modal, Button, Menu, Dropdown, Label } from 'semantic-ui-react';
import { Color } from '../../entities';

interface Props {
  open: boolean;
  dismiss: () => void;
  confirm: (drawing?: {
    width: number;
    height: number;
    path: string;
    strokeWidth: number;
    stroke: string;
  }) => void;
  drawing?: DrawingAttachment;
}

export const DrawingModal = ({ open, dismiss, confirm, drawing }: Props) => {
  const svgRef = createRef<SVGSVGElement>();
  const [paths, setPaths] = useState<Array<[string, number, number]>>([]);
  const [path, setPath] = useState((drawing && drawing.path) || '');
  const [svgX, setSvgX] = useState(0);
  const [svgY, setSvgY] = useState(0);
  const [minX, setMinX] = useState(Infinity);
  const [maxX, setMaxX] = useState(0);
  const [minY, setMinY] = useState(Infinity);
  const [maxY, setMaxY] = useState(0);
  const [mouseDown, setMouseDown] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [stroke, setStroke] = useState(Color.BLACK);
  const [strokeDropdownOpen, setStrokeDropdownOpen] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const { x, y } = svg.getBoundingClientRect();
    setSvgX(x);
    setSvgY(y);
  }, [svgRef]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setMouseDown(true);

    const x = event.clientX - svgX;
    const y = event.clientY - svgY;
    setMinX(Math.min(minX, x));
    setMaxX(Math.max(maxX, x));
    setMinY(Math.min(minY, y));
    setMaxY(Math.max(maxY, y));
    setPath(path + `M${x},${y}`);
    setPaths([...paths, ['M', x, y]]);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!mouseDown) return;

    const x = event.clientX - svgX;
    const y = event.clientY - svgY;
    setMinX(Math.min(minX, x));
    setMaxX(Math.max(maxX, x));
    setMinY(Math.min(minY, y));
    setMaxY(Math.max(maxY, y));
    setPath(path + `L${x},${y}`);
    setPaths([...paths, ['L', x, y]]);
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setMouseDown(false);
  };

  const resetDrawingBoard = () => {
    setPaths([]);
    setPath('');
    setMinX(Infinity);
    setMaxX(0);
    setMinY(Infinity);
    setMaxY(0);
    setStrokeWidth(5);
    setStroke(Color.BLACK);
  };

  const handleDone = () => {
    if (!paths.length) {
      confirm();
      return;
    }

    const boundingWidth = maxX - minX;
    const boundingHeight = maxY - minY;

    const dx = -(minX - 10);
    const dy = -(minY - 10);

    confirm({
      stroke,
      strokeWidth,
      width: boundingWidth + 20,
      height: boundingHeight + 20,
      path: paths.reduce(
        (fullPath, lineItem) =>
          `${fullPath}${lineItem[0]}${lineItem[1] + dx}, ${lineItem[2] + dy}`,
        ''
      ),
    });

    closeModal();
  };

  const closeModal = () => {
    resetDrawingBoard();
    dismiss();
  };

  // TODO: Move to config
  const strokeSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleStrokeSelect = (color: Color) => () => {
    setStroke(color);
    setStrokeDropdownOpen(false);
  };

  return (
    <Modal size="small" dimmer="inverted" open={open} onClose={closeModal}>
      <Modal.Header>Add your Drawing</Modal.Header>
      <Modal.Content>
        <Menu size="tiny">
          <Menu.Item header>Tools</Menu.Item>
          {/* <Menu.Item><Icon name="undo" /></Menu.Item>
                    <Menu.Item><Icon name="redo" /></Menu.Item> */}
          <Menu.Menu position="right">
            <Dropdown item text={`${strokeWidth}`}>
              <Dropdown.Menu>
                {strokeSizes.map((size) => (
                  <Dropdown.Item
                    key={size}
                    selected={size === strokeWidth}
                    onClick={() => setStrokeWidth(size)}
                  >
                    {size}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown
              item
              trigger={<Label color={stroke} />}
              onClick={() => setStrokeDropdownOpen(true)}
              onBlur={() => setStrokeDropdownOpen(false)}
            >
              <Dropdown.Menu open={strokeDropdownOpen}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    padding: 5,
                  }}
                >
                  {Object.values(Color).map((color, index) => (
                    <div 
                      style={{ margin: 2.5 }} 
                      key={index}
                    >
                      <Label
                        color={color}
                        onClick={handleStrokeSelect(color)}
                      />
                    </div>
                  ))}
                </div>
              </Dropdown.Menu>
            </Dropdown>
            {/* <Dropdown item text={stroke}>
                            <Dropdown.Menu>
                                <Card.Group itemsPerRow={3}>
                                    {Object.values(Color).map((color, index) => (
                                        <Card inverted key={index} color={color} />
                                    ))}
                                </Card.Group>
                            </Dropdown.Menu>
                        </Dropdown> */}
          </Menu.Menu>
        </Menu>
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <svg
            ref={svgRef}
            style={{
              width: '100%',
              height: '50vh',
            }}
          >
            <path
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
              stroke={stroke}
              fill="none"
              d={path}
            />
          </svg>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" content="Cancel" onClick={closeModal} />
        <Button
          content="Done"
          labelPosition="right"
          icon="checkmark"
          onClick={handleDone}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
};
