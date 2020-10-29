import React from 'react';
import '../styles/UpdateBubble.scss';

interface Props {
    title: string | HTMLElement | JSX.Element;
    content?: string | HTMLElement | JSX.Element;
    image?: HTMLElement | JSX.Element;
    imageSrc?: string;

    action?: () => void;
};

export default function UpdateBubble(props: Props) {
    return (
        <div className="update-bubble">
            <div className="image" onClick={props.action}>
                {props.image}
                {props.imageSrc && (<img src={props.imageSrc}/>)}
            </div>
            <div className="content">
                <div className="title">
                    {props.title}
                </div>
                {props.content}
            </div>
        </div>
    );
};