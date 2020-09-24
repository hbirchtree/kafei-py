import React from 'react';
import Icon from './Icon';
import '../styles/Footer.scss';
import { GithubRepository } from '../control/Types';

interface Props {
    source: GithubRepository;
}

export default function Footer(props: Props) {
    return (
        <div
            className="ui inverted vertical footer segment centered flex-centered"
        >
            <span>source can be found over at</span>
            <a href={props.source.link} className="flex-centered">
                <Icon icon='github' rounded={true} />
                <span>github</span>
            </a>
        </div>
    );
}
