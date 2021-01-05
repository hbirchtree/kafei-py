import React, { useEffect, useRef } from 'react';
import '../styles/Code.scss';
import { highlightBlock } from 'highlight.js';

interface Props {
    children: string | string[];
    language: string;
}

export default function Code(props: Props) {
    const codeBlock = useRef<HTMLElement>(null);

    useEffect(() => highlightBlock(codeBlock.current!), []);

    return (
        <div className='code-block'>
            <pre>
                <code ref={codeBlock} className={`${props.language}`}>
                    {props.children}
                </code>
            </pre>
        </div>
    );
}
