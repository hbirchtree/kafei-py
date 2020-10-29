import React, { useState, useEffect } from 'react';
import { DiagnosticState, DiagnosticData, reportFilter } from '../control/States';
import ReportView from '../components/ReportView';
import Code from '../components/Code';
import Graph from '../components/Graph';
import SearchField from '../components/SearchField';

interface Props {
    data: DiagnosticState;
}

export default function Diagnostics(props: Props) {
    const [diagnostics, setDiagnostics] = useState<DiagnosticData>();
    const [query, setQuery] = useState<string>();

    props.data.propagateUpdate = (data: DiagnosticData) => {
        setDiagnostics(data);
    };
    useEffect(() => {
        props.data.triggerUpdate();
    }, [props.data]);

    const tracerTemplate = props.data.endpoints.trace + '?source={src}';

    const crashList = diagnostics?.filteredCrashes || diagnostics?.crashes;
    const reportList = diagnostics?.filteredReports ||  diagnostics?.reports;

    const crashes = crashList?.map(crash => (
        <ReportView
            key={crash.data.crashId}
            data={crash}
            tracerTemplate={tracerTemplate}
            downloadUrl={props.data.endpoints.data +
                crash.links.filter(l => l.uri.endsWith('/profile'))[0].uri}
        />
    ));

    const reports = reportList?.map(report => (
        <ReportView
            key={report.data.reportId}
            data={report}
            tracerTemplate={tracerTemplate}
            downloadUrl={props.data.endpoints.data +
                report.links.filter(l => l.uri.endsWith('/raw'))[0].uri}
        />
    ));

    const onQueryUpdate = async (query: string) => {
        diagnostics!.filteredReports =
            diagnostics?.reports.filter(reportFilter(query));
        diagnostics!.filteredCrashes =
            diagnostics?.crashes.filter(reportFilter(query));
        setQuery(query);
    };

    const profilerUrl = diagnostics?.crashes[0]?.endpoints.profiler || 'https://coffee.birchy.dev';

    const loader = (
        <div className="ui active loader" style={{height: '8em'}}></div>
    );

    return (
        <div
            data-tab='nav::diag' 
            className='ui inverted text tab segment'
        >
            An embedded profiler in the application allows collecting some statistics as well as system information. For typical *nix operating systems this is done by:

            <Code language="bash">
                COFFEE_REPORT_URL={profilerUrl} &lt;program&gt;
            </Code>

            On Android it is possible by adding an extra value to the launch process:

            <Code language="bash">
                adb shell am start
                    -n &lt;com.package/.Activity&gt;
                    --es COFFEE_REPORT_URL {profilerUrl}
            </Code>

            <div className="ui two cards" style={{marginBottom: '4em'}}>
                <Graph
                    net={props.data.plain}
                    title="Operating systems"
                    source="/v1/statistics/os"
                    chartType="doughnut"
                    normalizer={e => e.split(' (')[0]}
                />
                <Graph
                    net={props.data.plain}
                    title="Architectures"
                    source="/v1/statistics/arch"
                    chartType="doughnut"
                />
                <Graph
                    net={props.data.plain}
                    title="Devices"
                    source="/v2/stats/devices"
                    chartType="doughnut"
                    selector={(e) => e['name']}
                    normalizer={e => e.split(' running')[0]}
                />
                <Graph
                    net={props.data.plain}
                    title="Applications"
                    source="/v2/stats/applications"
                    chartType="doughnut"
                    selector={(e) => e['name']}
                />
            </div>

            <SearchField 
                action={onQueryUpdate}
            />

            <div className="ui inverted top attached tabular menu">
                <a className="ui item active" data-tab="diag::report">
                    Reports
                </a>
                <a className="ui item" data-tab="diag::crash">
                    Crashes
                </a>
            </div>

            <div
                data-tab="diag::report"
                className="ui inverted bottom attached tab segment active"
            >
                {reports ? reports.length === 0 
                        ? (<p>No reports to display</p>) 
                        : reports 
                    : loader}
            </div>
            <div
                data-tab="diag::crash"
                className="ui inverted bottom attached tab segment"
            >
                {crashes ? crashes.length === 0 
                        ? (<p>No crashes to display</p>) 
                        : crashes 
                    : loader}
            </div>
        </div>
    );
}
