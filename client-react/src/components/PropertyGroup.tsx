import React from 'react';
import Icon from './Icon';
import '../styles/PropertyGroup.scss';

interface Props {
    icon: string;
    title: string;
    children?: JSX.Element[] | JSX.Element | undefined;
}

export default function PropertyGroup(props: Props) {
    return (
        <div className="ui container inverted property-group">
            <h4 className="ui horizontal divider header inverted">
                <span className="flex-centered">
                    <Icon icon={props.icon} />
                    {props.title}
                </span>
            </h4>
            <div className="ui divided internally called centered grid inverted">
                {props.children}
            </div>
        </div>
    );
}
