import React from 'react';
import { LoginState } from '../control/Auth';
import { GithubProfile } from '../control/Types';
import '../styles/AdminMenu.scss';

interface Props {
    profile?: GithubProfile;
    login?: LoginState;
};

export function AdminMenu (props: Props) {
    return (
        <div>
            <img src={props.profile?.img} className="ui tiny circular image" />
        </div>
    );
}
