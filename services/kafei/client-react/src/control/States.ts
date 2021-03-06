import {
    EndpointConfig,
    RESTMessage,
    CrashData,
    ReportData,
    MachineData,
    Stackframe,
    LinkData,
    signalToString,
} from './Types';

import type {
    ScopedFetch,
    NetValue,
    ServerListener,
} from './Netcode';

import type {
    AuthState,
} from './Auth';
import { ReleaseInfo } from './Yggdrasil';

export type NetState = {
    plain: ScopedFetch;
    auth: ScopedFetch;
};

export type ReportViewState = {
    submitTime: Date;
    machine?: MachineData;
};

export type CrashReportBaseState = NetState & {
    delete: () => Promise<void>;
    expand: (onFinish: () => void) => void;
    trigger?: () => void,

    endpoints: EndpointConfig;
    auths: AuthState;
    state: 'unloaded' | 'loading' | 'loaded';
    links: LinkData[],

    machineInfo: NetValue<MachineData>;
    reportView: ReportViewState;
};

export type CrashState = CrashReportBaseState & {
    data: CrashData;
    type: 'Crash',

    stdout: NetValue<string>;
    stderr: NetValue<string>;
    stackRaw: NetValue<string>;
    stack?: Stackframe[];
    logError?: string;
    logException?: string;
};

export type ReportState = CrashReportBaseState & {
    data: ReportData;
    type: 'Report',
};

export type ReportOrCrashState = ReportState | CrashState;

export let crashFactory = (
        base: DiagnosticState, 
        crash: RESTMessage<CrashData>,
        i: number
) => {

    if(!crash.links)
        return undefined;

    const getLinkMatching = (sig: string) =>
        crash.links!.filter(link => link.uri.endsWith('/' + sig))[0];

    const self: CrashState = {
        delete: async () => {
            return self.plain.fetch('', 'DELETE').then();
        },
        expand: async (onFinish) => {
            if(self.state !== 'unloaded')
                return;
            
            self.state = 'loading';

            await self.machineInfo.get!();
            await self.stdout.get!();
            await self.stderr.get!();
            await self.stackRaw.get!();

            onFinish();
        },

        stdout: {
            code: 0,
        },
        stderr: {
            code: 0,
        },
        stackRaw: {
            code: 0,
        },
        machineInfo: {
            code: 0,
        },

        endpoints: base.endpoints,
        links: crash.links,
        state: 'unloaded',
        data: crash.data!,
        type: 'Crash',
        plain: base.plain.prefixedWith(crash.links[0]),
        auth: base.auth.prefixedWith(crash.links[0]),
        auths: base.auths,
        reportView: {
            submitTime: crash.data!.submitTime,
        },
    };

    function createLinkActivator<T>(
        self: NetValue<T>,
        link: string
    ) {
        return () =>
            base.plain.activateJson<T>(getLinkMatching(link))
                .then(val => {
                    self.code = 200;
                    if(self.code === 200) {
                        self.data = val;
                        return self.data;
                    }
                });
    }
    function createRawLinkActivator(
        self: NetValue<string>,
        link: string
    ) {
        return () => 
            base.plain.activateRaw(getLinkMatching(link))
                .then((val) => {
                    self.code = 200;
                    if(self.code === 200 && val) {
                        self.data = val;
                    }
                });
    }

    self.stdout.get = createRawLinkActivator(self.stdout, 'stdout');
    self.stderr.get = createRawLinkActivator(self.stderr, 'stderr');
    
    self.stackRaw.get = async () => { 
        await createRawLinkActivator(self.stackRaw, 'stacktrace')();

        if(self.stackRaw.code !== 200)
            return;

        let stackframes: Stackframe[] = [];
        try {
            stackframes = JSON.parse(self.stackRaw.data);
        } catch {
            try {
                stackframes = JSON.parse(self.stackRaw.data + '{}]');
            } catch {}
        }
        self.stack = stackframes;
    };

    self.machineInfo.get = async () => {
        await createLinkActivator<MachineData>(self.machineInfo, 'machine')()
            .then((machine) => {
                self.reportView = {
                    machine: machine,
                    submitTime: self.reportView.submitTime,
                };
            });
    };

    return self;
};

export let reportFactory = (
    base: DiagnosticState,
    report: RESTMessage<ReportData>,
    i: number
): ReportState | undefined => {

    if(!report.links)
        return undefined;

    const self: ReportState = {
        data: report.data!,
        type: 'Report',
        links: report.links,
        state: 'unloaded',
        endpoints: base.endpoints,

        delete: async () => {
            await self.auth.fetch('', 'DELETE');
        },
        expand: async (onFinish) => {
            await self.machineInfo.get!();

            onFinish();
        },

        machineInfo: {
            code: 0
        },

        plain: base.plain.prefixedWith(report.links[0]),
        auth: base.auth.prefixedWith(report.links[0]),
        auths: base.auths,

        reportView: {
            submitTime: report.data!.submitTime,
        }
    };

    self.machineInfo.get = async () => {
        const result = await self.plain.fetch<MachineData>('');

        self.machineInfo.code = 200;
        if(self.machineInfo.code === 200 && result.data) {
            self.machineInfo.data = result.data;
            self.reportView.machine = result.data;
        }
    };

    return self;
};

export type DiagnosticData = {
    crashes: CrashState[];
    reports: ReportState[];

    filteredCrashes?: CrashState[];
    filteredReports?: ReportState[];
};

export type DiagnosticState = NetState & {
    endpoints: EndpointConfig;
    auths: AuthState;

    mqtt: ServerListener;

    triggerUpdate: () => Promise<void>;
    propagateUpdate?: (data: DiagnosticData) => void;
};

const metaFilters = [
    {
        key: 'system',
        filter: (item: ReportOrCrashState, param?: string) => {
            if(item.type !== 'Report' || !param)
                return false;
            const nparam = param.toLowerCase();
            return item.data.system.toLowerCase().indexOf(nparam) !== -1;
        },
    },
    {
        key: 'id',
        filter: (item: ReportOrCrashState, param?: string) => {
            if(!param)
                return false;
            
            if(item.type === 'Crash')
                return item.data.crashId + '' === param;
            else if(item.type === 'Report')
                return item.data.reportId + '' === param;
        },
    },
    {
        key: 'code',
        filter: (item: ReportOrCrashState, param?: string) => {
            if(item.type !== 'Crash' || !param)
                return false;

            const sig = signalToString(item.data.exitCode).toLowerCase();
            const paramSig = param.toLowerCase();

            return item.data.exitCode + '' === param || sig === paramSig;
        },
    },
];

export const reportFilter = (query?: string) => (item: ReportOrCrashState) => {
    if(!query || query.length === 0) {
        return true;
    }

    if(item.type === 'Report') {
        if(metaFilters[0].filter(item, query))
            return true;
    }

    return query.split(' ').map(queryi => {
        if(item.type === 'Crash') {
            const [key, value] = query.split(':');
            return metaFilters
                .map(filter => 
                    filter.key == key && filter.filter(item, value))
                .filter(res => res)
                .length > 0;
        } else if(item.type === 'Report') {
            const [key, value] = query.split(':');
            return metaFilters
                .map(filter =>
                        filter.key == key && filter.filter(item, value))
                .filter(res => res)
                .length > 0;
        }
    }).filter(res => res).length === query.split(' ').length;
};

export type ExamplesState = {
    info: ReleaseInfo;
    net: NetState;
};