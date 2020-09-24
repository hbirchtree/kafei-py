import React from 'react';
import feather from 'feather-icons';

interface Props {
    icon?: string;
    rounded?: boolean;
    foreground?: string;
    background?: string;

    size?: number;
    spacing?: number;
}

export default function Icon(props: Props) {
    const p = {
        icon: props.icon ? props.icon : 'box',
        rounded: props.rounded ? props.rounded : false,
        foreground: props.foreground ? props.foreground : 'white',
        background: props.background,

        size: props.size ? props.size : 20,
        spacing: props.spacing ? props.spacing : 4,
    };

    let out: JSX.Element;

    const style: React.CSSProperties = {
        backgroundColor: p.background,
        color: p.foreground,
        height: p.size,
        width: p.size,
    };

    if(p.rounded) {
        style.marginLeft = `${p.spacing}px`;
        style.marginRight = `${p.spacing}px`;
    }

    const svgData = feather.icons[p.icon] 
        ? {
            __html: feather.icons[p.icon].toSvg({
                color: p.foreground,
                height: p.size,
                width: p.size,
            })
        } 
        : undefined;

    if(p.rounded) {
        out = (
            <span className="generic-icon" dangerouslySetInnerHTML={svgData} style={{
                backgroundColor: p.background,
                borderRadius: '100px',
                color: p.foreground,
                height: `${p.size + 8}px`,
                marginLeft: `${p.spacing}px`,
                marginRight: `${p.spacing}px`,
                padding: '4px',
                width: `${p.size + 8}px`,
            }}>
            </span>
        );
    } else {
        out = (
            <span className="generic-icon" dangerouslySetInnerHTML={svgData}>
            </span>
        );
    }

    return out;
}
