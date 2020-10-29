import {
    DiagnosticState,
    NetState,
    crashFactory, 
    CrashState,
    ReportState, reportFactory
} from "./States";
import type {
    GithubProfile,
    GithubRelease,
    EndpointConfig,
    NavLink,
    RESTMessage,
    HTTPMethod,
    GithubCommit,
    CrashData,
    ReportData,
} from "./Types";
import type { AuthToken } from "./Auth";
import { LoginState } from './Auth';
import { ScopedFetch, endpointFetch, ServerListener } from "./Netcode";

export type ReleaseInfo = {
    releases: string[];
    primaryRepo: string;
};

export type Yggdrasil = {
    /* Internal data */
    endpoints: EndpointConfig;
    login: LoginState;

    /* UI Data */
    diagnostics: DiagnosticState;
    profile: GithubProfile;
    menu: {
        links: NavLink[];
        externals: NavLink[];
    };
    releases: ReleaseInfo;
};

export const seedTree = (
    endpoints: EndpointConfig,
    github: GithubProfile,
    release: string[],
    primaryRepo: string,
) => {
    let navLinks: NavLink[] = [
        {name: "Home", target: "nav::home", icon: "home"},
        {name: "Examples", target: "nav::examples", icon: "package"},
        {name: "Diagnostics", target: "nav::diag", icon: "activity"}
    ];
    let extLinks: NavLink[] = [
    ];
    let login: LoginState = new LoginState(
        {
            loggedIn: false,
            username: undefined,
            profileImg: undefined,
            fetch: async (source: string, method?: HTTPMethod, data?: any) => {
                const token: AuthToken = JSON.parse(localStorage['Kafei-Api-Token']);

                if(!token)
                    return;

                return await fetch(endpoints.data + source, {
                        method: method ? method : 'GET',
                        cache: 'no-cache',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': 'Bearer ' + token.token,
                            'Content-Type': 'application/json',
                        },
                        body: data ? JSON.stringify(data) : undefined,
                    }).then((content) => {
                        return content.json();
                    }).then((content: RESTMessage<any>) => {
                        if(content.data)
                            return content.data;
                        else
                            return content;
                    }).catch((err) => {
                        console.log(err);
                    });
            },
        },
        [
            {
                text: "Sign in",
                icon: "log-in",
                color: "green",
                action: async () => 
                {
                    if(await login.isLoggedIn(endpoints))
                        return;
                    const token: AuthToken | undefined = 
                        await login.authState.fetch('/v2/users/authenticate', 'POST', {
                            username: prompt('Username'),
                            password: prompt('Password')
                        })
                        .then(content => content as AuthToken);
                    if(!token)
                        return;
                    login.loggedInCycle(token);
                }
            },
            {
                text: "Register",
                icon: "edit-2",
                color: "blue",
                action: async () => {}
            }
        ],
        [
            {
                text: "Sign out",
                icon: "log-out",
                color: "red",
                action: async () => login.loggedOutCycle()
            }
        ],
    );
    login.links = login.outLinks;

    let net: NetState = {
        plain: new ScopedFetch(
            (resource: string, method?: HTTPMethod, data?: any) => 
                endpointFetch(endpoints, resource, method, data)),
        auth: new ScopedFetch(login.authState.fetch),
    };

    const diagState: DiagnosticState = {
        endpoints,
        auths: login.authState,
        auth: net.auth,
        plain: net.plain,
        mqtt: new ServerListener(['public/diagnostics/#']),
        triggerUpdate: async () => {
            let crashStates: CrashState[] | undefined;
            let reportStates: ReportState[] | undefined;

            const crashes = await net.plain.fetch<RESTMessage<CrashData>[]>(
                '/v2/crash');
            if(crashes.data)
                crashStates = 
                    crashes.data.reverse().map((c, i) =>         
                        crashFactory(diagState, c, i)!);
            const reports = await net.plain.fetch<RESTMessage<ReportData>[]>(
                '/v2/reports');
            if(reports.data)
                reportStates = reports.data.reverse().map((r, i) =>
                    reportFactory(diagState, r, i)!);

            diagState.propagateUpdate && diagState.propagateUpdate({
                crashes: crashStates ? crashStates : [],
                reports: reportStates ? reportStates : [],
            });
        },
    };

    diagState.mqtt.addJsonHandler(async () => {
        console.log('got MQTT message');
        await diagState.triggerUpdate();
    });

    const out: Yggdrasil = {
        endpoints: endpoints,
        login: login,

        diagnostics: diagState,
        profile: github,
        menu: {
            links: navLinks,
            externals: extLinks,
        },
        releases: {
            releases: release,
            primaryRepo,
        }
    };

    return out;
};
