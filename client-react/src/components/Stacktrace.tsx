import React from 'react';
import { Stackframe } from '../control/Types';
import Code from './Code';
import PropertyGroup from './PropertyGroup';

interface Props {
    data: Stackframe[];
}

export default function Stacktrace(props: Props) {
    const stackframes = props.data
        .filter(frame => frame.frame !== undefined)
        .map(frame => {
            const type = frame.frame.startsWith('void ') ? '' : 'auto ';
            const sigStart = frame.frame.indexOf('(');
            const signature = (sigStart !== -1 ? frame.frame.substr(0, sigStart) : frame.frame) + '(...)';
            const out = frame.ip.replace('0x0x', '0x') + ' ' + type + signature + '\n';

            return out;
        });

    return (
        <PropertyGroup icon='file-text' title='Stacktrace'>
            <div className="ui segment left aligned inverted stack-segment">
                <Code language="cpp">
                    {stackframes}
                </Code>
            </div>
        </PropertyGroup>
    );
}
