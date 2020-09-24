import React, { useState } from 'react';
import { CrashState, ReportOrCrashState, ReportState } from '../control/States';
import Machine from './Machine';
import '../styles/ReportView.scss';
import { data } from 'jquery';
import Stacktrace from './Stacktrace';
import TextFileView from './TextFileView';
import PropertyGroup from './PropertyGroup';

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

    return (
        <>
        <div onClick={expand} className='report-header'>
            {dataType} - {state.type === 'Report' ? state.data.system : ''}
        </div>
        <div className={`report-view ${displayState}`}>
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
                { state.type === 'Crash' && state.stack ? (
                        <Stacktrace data={state.stack} />
                ) : <></>
                }
                <PropertyGroup icon='' title='Logs'>
                    { state.type === 'Crash' && state.stdout.code === 200 ? (
                            <TextFileView data={state.stdout.data} />
                    ) : <></>
                    }
                    { state.type === 'Crash' && state.stderr.code === 200 ? (
                            <TextFileView data={state.stderr.data} />
                    ) : <></>
                    }
                </PropertyGroup>
                </>
            ) : (
                <></>
            )
            }
        </div>
        </>
    );
}
