<script lang="ts">
    import {onMount} from 'svelte';
    import Navbar from './Navbar.svelte';
    import Home from './Home.svelte';
    import Statistics from './Statistics.svelte';
    import Examples from './Examples.svelte';
    import Diagnostics from './Diagnostics.svelte';
    import Footer from './Footer.svelte';
    import * as j from 'jquery';
    import type { 
        NavLink,
        GithubProfile,
        GithubRepository,
        MenuLink, 
        EndpointConfig,
        HTTPMethod,
        GithubCommit,
        RESTMessage,
        GithubRelease,
        CrashData,
        ReportData,
    } from './Types';
    import type {
        AuthState,
        AuthToken,
        AuthVerification,
    } from './Auth';
    import {
        LoginState,
    } from './Auth.ts';
	import type {
        DiagnosticState
    } from './States';
    import {
        crashFactory,
        NetState,
    } from './States.ts';
    import {
        ScopedFetch,
        endpointFetch,
        ServerListener,
    } from './Netcode.ts';
	
    export let github: GithubProfile;
    export let repository: { link: string };
    export let endpoints: EndpointConfig;

    let navLinks: NavLink[] = [
            {name: "Home", target: "nav::home", icon: "home"},
            {name: "Examples", target: "nav::examples", icon: "package"},
            {name: "Statistics", target: "nav::stats", icon: "pie-chart"},
            {name: "Diagnostics", target: "nav::diag", icon: "activity"}
    ];
    let extLinks: NavLink[] = [
    ];
    let login: LoginState = new LoginState(
        {
            loggedIn: false,
            username: null,
            profileImg: null,
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

    let releases: [string, GithubRelease][] = [];
    let releasesMap: Map<string, GithubRelease> = new Map();
    let commitInfo: GithubCommit | undefined;

    async function initialize_releases() {
        [
            '/github/latestRelease/hbirchtree_coffeecutie',
            '/github/latestRelease/hbirchtree_coffeecutie-imgui',
            '/github/latestRelease/hbirchtree_native-library-bundle',
        ].map(async rel => 
            await net.plain.fetch<GithubRelease>(rel)
                .then(rel => {
                    if(rel.data) {
                        releases.push([rel.data.repository.name, rel.data]);
                        releasesMap.set(rel.data.repository.name, rel.data);
                    }
                }));
    }
    async function initialize_commit() {
        const update = await net.plain.fetch<GithubCommit>(
            '/github/updateInfo/hbirchtree_coffeecutie');
        if(update.data)
            commitInfo = update.data;
    }

    async function get_resources() {
        initialize_releases();
        initialize_commit();
    }

    onMount(async () => {
        window.$('.ui.menu .item').tab();
        
        await get_resources();
        // await login.isLoggedIn(endpoints);
    });

    const diagState: DiagnosticState = {
        endpoints,
        auths: login.authState,
        auth: net.auth,
        plain: net.plain,
        mqtt: new ServerListener(['public/diagnostics/#'])
    };

    (async () => {
        const crashes = await net.plain.fetch<RESTMessage<CrashData>[]>(
            '/v2/crash');
        if(crashes.data)
            diagState.crashes = crashes.data.reverse().map((c, i) =>         
                crashFactory(diagState, c, i));
        const reports = await net.plain.fetch<RESTMessage<ReportData>[]>(
            '/v2/reports');
        if(reports.data)
            diagState.reports = reports.data.reverse().map((r, i) =>
                {data: r});
        
        console.log('crashes', diagState.crashes);
    })();
</script>

<link rel="stylesheet" type="text/css" href="semantic/semantic.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/container.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/grid.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/header.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/menu.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/modal.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/tab.min.css">

<Navbar
    links={navLinks}
    externals={extLinks}
    github={github}
    login={login}
/>

<div data-tab="nav::home" class="ui inverted text tab segment active">
    <Home 
        github={github}
        releases={ [].concat(releases.map(e => e[1])) }
    />
</div>
<div data-tab="nav::examples" class="ui inverted text tab segment">
    <Examples 
        github={github}
        releaseInfo={ {} }
        commitInfo={commitInfo}
    />
</div>
<div data-tab="nav::stats" class="ui inverted text tab segment">
    <Statistics
        endpoints={endpoints}
    />
</div>
<div data-tab="nav::diag" class="ui inverted text tab fluid segment">
    <Diagnostics
        state={diagState}
    />
    <!-- endpoints={endpoints} authState={authState} /> -->
</div>

<Footer/>

<style>
    div.segment:not(.fluid) {
        max-width: 60em;
        margin-left: auto;
        margin-right: auto;
    }
</style>

<link href="https://fonts.googleapis.com/css?family=Ubuntu+Mono:400,400i,700&amp;subset=latin-ext" rel="stylesheet">

