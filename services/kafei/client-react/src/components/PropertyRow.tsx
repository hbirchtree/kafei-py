import React from 'react';

interface Props {
    name: string;
    children?: JSX.Element | JSX.Element[] | (string | undefined) | (string | undefined)[];
}

export default function PropertyRow(props: Props) {
    return (
        <div className="ui row inverted property-row">
            <div className="ui right aligned four wide column header inverted">
                <h5 className="ui header inverted">
                    {props.name}
                </h5>
            </div>
            <div className="ui ten wide column inverted flex-row">
                {props.children}
            </div>
        </div>
    );
}
