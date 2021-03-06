import React, { useState } from 'react';
import { ReportOrCrashState } from '../control/States';
import Machine from './Machine';
import '../styles/ReportView.scss';
import Stacktrace from './Stacktrace';
import TextFileView from './TextFileView';
import PropertyGroup from './PropertyGroup';
import Icon from './Icon';
import { signalToString } from '../control/Types';

interface Props {
    data: ReportOrCrashState;

    tracerTemplate: string;
    downloadUrl: string;
}

export default function ReportView(props: Props) {
    const [state, setState] = useState(props.data);
    const [loadState, setLoadState] = useState(props.data.state);
    const [displayState, setDisplayState] = useState<'collapsed' | 'shown'>('collapsed');

    const dataType = state.type;

    const expand = async () => {
        if(displayState === 'collapsed')
            setDisplayState('shown');
        else
            setDisplayState('collapsed');

        if(loadState !== 'unloaded')
            return;

        setLoadState('loading');
        state.expand(() => {
            setLoadState('loaded');
            setState(state);
        });
    };

    let itemId = 0;
    if(state.type === 'Crash') {
        itemId = state.data.crashId;
    } else if(state.type === 'Report') {
        itemId = state.data.reportId;
    }

    let systemManufacturer, operatingSystem, osVersion;
    if(state.type === 'Report')
    {
        systemManufacturer =
            state.data.system.split(' running ')[0].split(' ')[0];
        operatingSystem =
            state.data.system.split(' running ')[1];
    }
    const tags = [
        systemManufacturer ?
            (<a className="ui label green">{systemManufacturer}</a>) : null,
        operatingSystem ?
            (<a className="ui label blue">{operatingSystem}</a>) : null,
    ];

    return (
        <>
        <div onClick={expand} className='report-header'>
            {dataType} - {state.type === 'Report' 
                ? state.data.system.split(' running')[0] 
                : signalToString(state.data.exitCode)}
            {tags}
            <Icon icon="chevron-down"/>
        </div>
        <div className={`report-view ${displayState}`} style={{position: 'relative'}}>
            {displayState === 'shown' ?  (
                <>
                <Machine
                    data={state.reportView}
                    name={dataType}
                    id={itemId}
                    download={() => window.open(props.downloadUrl, '_blank')}
                    view={() => 
                        window.open(props.tracerTemplate.replace(
                            '{src}',
                            props.downloadUrl))}
                />
                {loadState === 'loading' && (
                    <div className="ui active loader" style={{
                        position: 'relative',
                        height: '40px' }}>
                    </div>
                )}
                { state.type === 'Crash' && state.stack ? (
                        <Stacktrace data={state.stack} />
                ) : <></>
                }
                {state.type === 'Crash' && (
                    state.stdout.code === 200 || state.stderr.code === 200) 
                    && (
                <PropertyGroup icon='' title='Logs'>
                    { state.stdout.code === 200 ? (
                            <TextFileView data={state.stdout.data} />
                    ) : <></>
                    }
                    { state.stderr.code === 200 ? (
                            <TextFileView data={state.stderr.data} />
                    ) : <></>
                    }
                </PropertyGroup>
                )}
                </>
            ) : (
                <></>
            )
            }
        </div>
        </>
    );
}
