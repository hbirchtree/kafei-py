import type {
    EndpointConfig,
    RESTMessage,
    CrashData,
    ReportData,
    MachineData,
    Stackframe,
} from './Types';

import type {
    ScopedFetch,
    NetValue,
    MqttListener,
    ServerListener,
} from './Netcode';

import type {
    AuthState,
} from './Auth';
import { validate_component } from 'svelte/internal';

export type NetState = {
    plain: ScopedFetch;
    auth: ScopedFetch;
};

export type ReportViewState = {
    submitTime: Date;
    machine?: MachineData;
    base?: CrashReportBaseState;
};

export type CrashReportBaseState = NetState & {
    delete: () => Promise<void>;
    expand: (toiletFlush: DiagnosticState) => void;

    endpoints: EndpointConfig;
    auths: AuthState;
    state: 'unloaded' | 'loading' | 'loaded';

    alternate: boolean;
    backgroundColor: string;

    machineInfo?: NetValue<MachineData>;
    reportView: ReportViewState;
};

export type CrashState = CrashReportBaseState & {
    data: CrashData;

    stdout: NetValue<string>;
    stderr: NetValue<string>;
    logError?: string;
    logException?: string;
    stack?: NetValue<Stackframe[]>;
};

export type ReportState = CrashReportBaseState & {
    data: ReportData;
};

export let crashFactory = (
        base: DiagnosticState, 
        crash: RESTMessage<CrashData>,
        i: number
    ) => {

    const getLinkMatching = (sig: string) =>
        crash.links.filter(link => link.uri.endsWith('/' + sig))[0];

    const deleteLink = crash.links.filter(link => link.method === 'DELETE')[0];

    function createLinkActivator<T>(
        self: NetValue<T>,
        link: string
    ) {
        return () =>
            base.plain.activate<T>(getLinkMatching(link))
                .then((val: T) => {
                    self.code = 200;
                    if(self.code == 200) {
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
                    if(self.code == 200 && val) {
                        self.data = val;
                    }
                });
    }

    const self: CrashState = {
        delete: async () => {
            return base.plain.activate(deleteLink).then();
        },
        expand: async () => {
            console.log('expand');

            if(self.state != 'unloaded')
                return;
            
            self.state = 'loading';
            console.log('loading...');

            await self.machineInfo.get();
            await self.stdout.get();
            await self.stderr.get();
            await self.stack.get();
            
            /* Much like sitting on a public toilet, you haven't done
             * anything unless you flush the toilet.
             * This is how Svelte works too. */
            base.crashes[i] = base.crashes[i];

            self.state = 'loaded';
            console.log('all loaded');
        },

        stdout: {
            code: 0,
        },
        stderr: {
            code: 0,
        },
        stack: {
            code: 0,
        },
        machineInfo: {
            code: 0,
        },

        endpoints: base.endpoints,
        state: 'unloaded',
        alternate: i % 2 == 0,
        backgroundColor: (i % 2 == 0) ? "#202035" : "#151530",
        data: crash.data,
        plain: base.plain,
        auth: base.auth,
        auths: base.auths,
        reportView: {
            submitTime: crash.data.submitTime,
        },
    };

    self.stdout.get = createRawLinkActivator(self.stdout, 'stdout');
    self.stderr.get = createRawLinkActivator(self.stderr, 'stderr');
    
    self.stack.get = async () => { 
        await createLinkActivator(self.stack, 'stacktrace')(); 
    };

    self.machineInfo.get = async () => {
        await createLinkActivator(self.machineInfo, 'machine')()
            .then((machine: MachineData) => {
                self.reportView.machine = machine;
            });
    };
    self.reportView.base = self;

    return self;
};

export type DiagnosticState = NetState & {
    endpoints: EndpointConfig;
    auths: AuthState;

    mqtt: ServerListener;

    crashes?: CrashState[];
    reports?: ReportState[];
};
