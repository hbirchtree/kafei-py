import React from 'react';
import { Color } from '../control/Types';
import '../styles/Button.scss';
import Icon from './Icon';

interface Props {
    action?: () => void;
    color?: Color;
    margin?: string;
    label: string;
    icon?: string;
}

export default function Button(props: Props) {
    return (
        <button 
            disabled={!props.action}
            onClick={props.action}
            className={`ui ${props.color ? props.color : 'blue'} button flex-centered-important`}
            style={{margin: props.margin ? props.margin : '1em'}}
        >
            {props.icon && (<Icon icon={props.icon} />)} {props.label}
        </button>
    );
}