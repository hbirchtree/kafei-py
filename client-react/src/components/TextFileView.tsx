import React from 'react';
import Code from './Code';

interface Props {
    data: string;
}

export default function TextFileView(props: Props) {
    return (
        <div 
            className="ui segment left aligned inverted log-segment"
            style={{flexGrow: 1, margin: 0, padding: 0}}
        >
            <Code language="none">
                {props.data}
            </Code>
        </div>
    );
}
