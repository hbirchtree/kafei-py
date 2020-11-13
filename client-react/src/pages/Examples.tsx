import React, { useState } from 'react';
import UpdateBubble from '../components/UpdateBubble';
import { ExamplesState } from '../control/States';
import { GithubCommit, GithubRelease, LoadState } from '../control/Types';

interface Props {
    releases: ExamplesState;
}

export default function Examples(props: Props) {
    const [releases, setReleases] = useState<{ releases?: GithubRelease[] , state: LoadState}>({state: 'unloaded'});
    const [commit, setCommit] = useState<{ commit?: GithubCommit, state: LoadState }>({state: 'unloaded'});

    if (releases.state === 'unloaded')
    {
        const net = props.releases.net.plain;

        (async () => {
            const out = props.releases.info.releases.map(rel =>
                net.fetch<GithubRelease>(
                    "/github/latestRelease/" + rel.replace('/', '_')));
            Promise.all(out).then(out => {
                const results = out.map(
                        rel => rel.data ? rel.data : undefined)
                    .filter(
                        rel => rel) as GithubRelease[];
                setReleases({releases: results, state: 'loaded'});
            });
        })();
        setReleases({state: 'loading'});
    }
    if (commit.state == 'unloaded')
    {
        const net = props.releases.net.plain;

        (async () => {
            const out = await net.fetch<GithubCommit>(
                "/github/updateInfo/" + props.releases.info.primaryRepo.replace('/', '_'));
            
            if (out && out.data)
                setCommit({state: 'loaded', commit: out.data});
        })();
    }

    const commitView = commit.state === 'loaded' && commit.commit && commit.commit.head_commit
        ? (<UpdateBubble 
            title={props.releases.info.primaryRepo}
        content={(<>
            {commit.commit.head_commit?.message.split('\n').map(
                line => (<p key={line} style={{margin: "0"}}>{line}</p>))}
            </>)}
        />)
        : (<div className="ui active loader" style={{height: "2em"}}></div>);

    const content = releases.state === 'loaded' && releases.releases
        ? releases.releases.map((rel, i) => {
            const link = (<a key={i} href={rel.release?.html_url}>
                    {rel.release?.tag_name}
                </a>);
            return (<div key={i} className="row">
                <div className="column"><p>{rel.repository?.name}</p></div>
                <div className="column">{link}</div>
            </div>);
        })
        : (<div className="ui active loader" style={{height: "2em"}}>
        </div>);

    return (
        <div
            data-tab='nav::examples' 
            className='ui inverted text tab segment'
        >
            <div style={{position: 'relative'}}>
                {commitView}
            </div>
            <p>
                Every release generates downloadable binaries for Linux and macOS platforms, found here:
            </p>
            <div className="ui two column grid" style={{
                position: 'relative'}}
            >
                <div className="row">
                    <div className="column"><b>Repository</b></div>
                    <div className="column"><b>Release</b></div>
                </div>
                {content}
            </div>
        </div>
    );
}
