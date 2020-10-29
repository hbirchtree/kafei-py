import React, { useState } from 'react';

interface Props {
    size?: number;
    tags?: string[];

    action: (query: string, tags?: string[]) => Promise<void>;
};

export default function SearchField(props: Props) {
    const [current, setCurrent] = useState<string>('');

    const onChange = (change: React.ChangeEvent<HTMLInputElement>) => {
        if(current != change.target.value) {
            setCurrent(change.target.value);
            props.action(change.target.value, props.tags);
        }
    };

    return (
        <div
            className={`ui inverted icon input ${props.tags && 'right labeled'}`}
            style={{fontSize: props.size ? props.size + 'px' : '1.2em'}}
        >
            <input
                type="text"
                placeholder="Search..."
                onInput={onChange}
            />
            <i className="search icon"></i>
            {/* {props.tags && props.tags.map(tag => 
                (<a className="ui tag label">{tag}</a>))} */}
        </div>
    );
};