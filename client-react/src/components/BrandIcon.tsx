import React from 'react';
import { Color, vendorToIcon } from '../control/Types';
import Icon from './Icon';
import simpleIcons from 'simple-icons';

interface Props {
    basedOn?: string;
    icon?: string;
    size?: number;
    color?: Color;
};

export function BrandIcon (props: Props) {
    const p = {
        icon: props.icon ? props.icon : vendorToIcon(props.basedOn),
        size: props.size ? props.size : 24,
        color: props.color ? props.color : 'white',
    };

    const icon = p.icon ? simpleIcons.get(p.icon) : undefined;

    if(!icon) {
        return (
            <Icon size={p.size} icon='box'/>
        );
    } else {
        return (
            <div className="brand-icon" style={{
                backgroundColor: p.color,
                mask: `url(data:image/svg+xml,${encodeURI(icon.svg)})`,
                WebkitMask: `url(data:image/svg+xml,${encodeURI(icon.svg)})`,
                height: `${p.size}px`,
                width: `${p.size}px`,
            }}>
            </div>
        );
    }
}
