import React, { useState, useEffect } from 'react';
import { DiagnosticState, DiagnosticData, crashFactory } from '../control/States';
import ReportView from '../components/ReportView';

interface Props {
    data: DiagnosticState;
}

export default function Diagnostics(props: Props) {
    const [diagnostics, setDiagnostics] = useState<DiagnosticData>();

    props.data.propagateUpdate = (data: DiagnosticData) => {
      setDiagnostics(data);
    };
    useEffect(() => {
        props.data.triggerUpdate();
    }, [props.data]);

    const tracerTemplate = props.data.endpoints.trace + '?source={src}';

    const crashes = diagnostics?.crashes.map(crash => (
        <ReportView
            key={crash.data.crashId}
            data={crash}
            tracerTemplate={tracerTemplate}
            downloadUrl={props.data.endpoints.data +
                crash.links.filter(l => l.uri.endsWith('/profile'))[0].uri}
        />
    ));

    const reports = diagnostics?.reports.map(report => (
        <ReportView
            key={report.data.reportId}
            data={report}
            tracerTemplate={tracerTemplate}
            downloadUrl={props.data.endpoints.data +
                report.links.filter(l => l.uri.endsWith('/raw'))[0].uri}
        />
    ));

    return (
        <div
            data-tab='nav::diag' 
            className='ui inverted text tab segment'
            style={{ position: 'relative' }}
        >
            Crashes:
            {crashes}

            Reports:
            {reports}
        </div>
    );
}
