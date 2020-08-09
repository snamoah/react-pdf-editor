import React, { useState, createRef, useEffect } from 'react';
import { Modal, Button, Container } from "semantic-ui-react";

interface Props {
    open: boolean;
    dismiss: () => void;
    confirm: () => void;
    drawing?: DrawingObject;
}

export const DrawingModal = ({ open, dismiss, confirm, drawing }: Props) => {
    const svgRef = createRef<SVGSVGElement>();
    const [paths, setPaths] = useState<Array<[string, number, number]>>([]);
    const [path, setPath] = useState('');
    const [svgX, setSvgX] = useState(0);
    const [svgY, setSvgY] = useState(0);
    const [positionX, setPositionX] = useState(drawing && drawing.x || 0);
    const [positionY, setPositionY] = useState(drawing && drawing.y || 0);
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
        setPath(path + `M${x},${y}`);
        setPaths([...paths, ['M', x, y]]);
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!mouseDown) return;

        const x = event.clientX - svgX;
        const y = event.clientY - svgY;
        setPath(path + `L${x},${y}`);
        setPaths([...paths, ['L', x, y]]);
    }

    const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setMouseDown(false);
    }

    return (
        <Modal 
            size="small"
            open={open}
        >
            <Modal.Header>Add your Drawing</Modal.Header>
            <Modal.Content>
                <div
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <div>

                    </div>
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
                    onClick={dismiss} />
                <Button
                    content="Done"
                    labelPosition="right"
                    icon="checkmark"
                    onClick={confirm}
                    positive />
            </Modal.Actions>
        </Modal>
    )
}