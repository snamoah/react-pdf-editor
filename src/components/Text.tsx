import React from 'react';

interface Props {
    text?: string;
    width: number;
    height: number;
}

export const Text: React.FC<Props> = ({
    text,
    width,
    height,
}) => {

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height,
            border: 1,
            borderColor: 'grey'
        }}>
            <span>{text}</span>
        </div>
    )
}