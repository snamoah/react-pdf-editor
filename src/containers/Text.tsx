import React from 'react';
import { Text as Component } from '../components/Text'

export const Text = ({ text, width, height }: TextObject) => {

   
    return (
        <Component
            width={width}
            height={height}
            text={text}
        />
    );
}