import React from 'react';
import '../styles/NavBar.scss';
import { NavLink } from "../control/Types";
import Icon from './Icon';
import { AdminMenu } from './AdminMenu';

interface Props {
    defaultItem: string;
    callback: (navTarget: string) => void;
    internalLinks: NavLink[];
    externalLinks: NavLink[];
};

export default function NavBar (props: Props) {
    const desktopItems = props.internalLinks
        .concat(props.externalLinks)
        .map(link => (
        <a 
            key={link.target}
            data-tab={link.target} 
            className={`ui item${link.target === props.defaultItem ? ' active' : ''}`}
            onClick={() => props.callback(link.target)}
        >
            <h3>{link.name}</h3>
        </a>
    ));

    const mobileMenu = React.useRef<HTMLDivElement>(null);
    const closeMobileMenu = () => 
        mobileMenu.current!.classList.remove('active');
    const mobileItems = props.internalLinks
        .concat(props.externalLinks)
        .map(link => (
        <a 
            key={link.target}
            className={`ui item${link.target === props.defaultItem ? ' active' : ''}`}
            data-tab={link.target}
            onClick={() => { closeMobileMenu(); props.callback(link.target); }}
        >
            <Icon icon={link.icon} />
            <b>{link.name}</b>
        </a>
    ));

    return (
        <>
            <div className="ui inverted menu desktop navbar">
                {desktopItems}
            </div>
            <div className="ui inverted menu mobile navbar vertcal fluid">
                <div ref={mobileMenu}>
                    {mobileItems}
                </div>
            </div>
            <AdminMenu />
        </>
    );
}
