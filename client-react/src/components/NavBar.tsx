import React from 'react';
import '../styles/NavBar.scss';
import { GithubProfile, NavLink } from "../control/Types";
import Icon from './Icon';
import { AdminMenu } from './AdminMenu';
import { LoginState } from '../control/Auth';

interface Props {
    defaultItem: string;
    callback: (navTarget: string) => void;
    internalLinks: NavLink[];
    externalLinks: NavLink[];

    profile?: GithubProfile;
    login?: LoginState;
};

export default function NavBar (props: Props) {
    const desktopItems = props.internalLinks
        .concat(props.externalLinks)
        .map((link, i) => (
        <a 
            key={link.target}
            data-tab={link.target} 
            className={`ui item${link.target === props.defaultItem ? ' active' : ''}`}
            onClick={() => props.callback(link.target)}
        >
            <Icon icon={link.icon} size={i === 0 ? 32 : 16} />
            {i !== 0 && (<h3>{link.name}</h3>)}
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
            <div className="ui inverted menu desktop navbar" style={{
                position: "sticky",
                top: 0,
                backgroundColor: "transparent !important",
                zIndex: 100,
            }}>
                {desktopItems}
                <span style={{flexGrow: 1}}></span>
                <AdminMenu profile={props.profile} login={props.login} />
            </div>
            <div className="ui inverted menu mobile navbar vertcal fluid">
                <div ref={mobileMenu}>
                    {mobileItems}
                </div>
            </div>
        </>
    );
}
