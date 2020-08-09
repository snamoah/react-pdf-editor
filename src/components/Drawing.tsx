import React, { createRef, useEffect } from 'react';

export const Drawing = ({ width, height, path }: DrawingObject) => {
    const svgRef = createRef<SVGSVGElement>()

    useEffect(() => {
        const svg = svgRef.current;
        if (svg) {
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
        }
    }, [svgRef])

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width,
                height
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