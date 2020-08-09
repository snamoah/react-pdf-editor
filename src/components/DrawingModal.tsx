import React, { useState, createRef, useEffect } from 'react';
import { Modal, Button } from "semantic-ui-react";

interface Props {
    open: boolean;
    dismiss: () => void;
    confirm: (drawing?: { width: number, height: number, path: string }) => void;
    drawing?: DrawingObject;
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
    const[ maxY, setMaxY] = useState(0);
    const [mouseDown, setMouseDown] = useState(false);

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
    }

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
    }

    const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setMouseDown(false);
    }

    const resetDrawingBoard = () => {
        setPaths([]);
        setPath('');
        setMinX(Infinity);
        setMaxX(0);
        setMinY(Infinity);
        setMaxY(0);
    }

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
            width: boundingWidth + 20,
            height: boundingHeight + 20,
            path: paths.reduce((fullPath, lineItem) => 
                `${fullPath}${lineItem[0]}${lineItem[1] + dx}, ${lineItem[2] + dy}`
            , ''),
        });  

        closeModal();
    }

    const closeModal = () => {
        resetDrawingBoard();
        dismiss();
    }

    return (
        <Modal 
            size="small"
            dimmer="inverted"
            open={open}
            onClose={closeModal}
        >
            <Modal.Header>Add your Drawing</Modal.Header>
            <Modal.Content>
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
                        }}>
                        <path
                            strokeWidth="5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            stroke="black"
                            fill="none"
                            d={path}
                        />
                    </svg>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    color="black"
                    content="Cancel"
                    onClick={closeModal} />
                <Button
                    content="Done"
                    labelPosition="right"
                    icon="checkmark"
                    onClick={handleDone}
                    positive />
            </Modal.Actions>
        </Modal>
    )
}