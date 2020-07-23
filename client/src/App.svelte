<script>
    import Navbar from './Navbar.svelte';
    import Home from './Home.svelte';
    import Statistics from './Statistics.svelte';
    import Examples from './Examples.svelte';
    import Diagnostics from './Diagnostics.svelte';
    import Footer from './Footer.svelte';
    import * as j from 'jquery';

    import {onMount} from 'svelte';
	
    let navLinks = [
            {name: "Home", target: "nav::home", icon: "home"},
            {name: "Examples", target: "nav::examples", icon: "package"},
            {name: "Statistics", target: "nav::stats", icon: "pie-chart"},
            {name: "Diagnostics", target: "nav::diag", icon: "activity"}
    ];
    let extLinks = [
    ];
    export let github;
    export let repository;
    let authOutLinks = [
            {text: "Sign in", color: "green", action: async () => {
                if(await isLoggedIn())
                    return;
                const token = await auth_resource('/v2/users/authenticate', {
                                    username: prompt('Username'),
                                    password: prompt('Password')
                                });
                if(!token)
                    return;
                loggedInCycle(token);
            }},
            {text: "Register", color: "blue", action: async () => {
                
            }}
    ];
    let authInLinks = [
            {text: "Sign out", color: "red", action: async () => { loggedOutCycle(); }}
    ];
    let authLinks = authOutLinks;
    let authState = {
        loggedIn: false,
        username: null,
        profileImg: null
    };

    export let releaseInfo = null;
    export let imguiReleaseInfo = null;
    export let nativeReleaseInfo = null;
    export let commitInfo = null;

    export let endpoints;

    async function isLoggedIn() {
        try {
            let currToken = JSON.parse(localStorage['Kafei-Api-Token']);

            if(currToken) {
                const isLoggedIn = await auth_resource(
                    '/v2/users/checkAuthenticate', currToken);
                
                if(isLoggedIn)
                {
                    loggedInCycle(currToken);
                    return true;
                }
            }
        } catch(err) {}
        return false;
    }

    function loggedInCycle(token) {
        localStorage['Kafei-Api-Token'] = JSON.stringify(token);
        authState.loggedIn = true;
        authState.username = token.username;
        authLinks = authInLinks;
    }
    function loggedOutCycle() {
        localStorage.removeItem('Kafei-Api-Token');
        authState.loggedIn = false;
        authState.username = null;
        authLinks = authOutLinks;
    }

    async function auth_resource(source, data) {
        return await fetch(endpoints.data + source, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data)
            }).then((content) => {
                return content.json();
            }).then((content) => {
                if(content.data)
                    return content.data;
                else
                    return content;
            }).catch((err) => {
                console.log(err);
            });
    }

    async function get_resource(source) {
        return fetch(endpoints.data + source)
            .then((content) => {
                return content.json(); 
            })
            .then((content) => {
                return content.data;
            }).catch((err) => {
                console.log(err);
            });
    }

    async function initialize_releases() {
        releaseInfo = await get_resource('/github/latestRelease/hbirchtree_coffeecutie');
        imguiReleaseInfo = await get_resource('/github/latestRelease/hbirchtree_coffeecutie-imgui');
        nativeReleaseInfo = await get_resource('/github/latestRelease/hbirchtree_native-library-bundle');
    }
    async function initialize_commit() {
        commitInfo = await get_resource('/github/updateInfo/hbirchtree_coffeecutie');
    }

    async function get_resources() {
        initialize_releases();
        initialize_commit();
    }

    onMount(async () => {
        window.$('.ui.menu .item').tab();
        
        await get_resources();

        await isLoggedIn();
    });
</script>

<link rel="stylesheet" type="text/css" href="semantic/semantic.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/container.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/grid.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/header.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/menu.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/modal.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/tab.min.css">

<Navbar links={navLinks} externals={extLinks} github={github} authLinks={authLinks} authState={authState}/>

<div data-tab="nav::home" class="ui inverted text tab segment active">
    <Home github={github} endpoints={endpoints} releaseInfo={releaseInfo} imguiReleaseInfo={imguiReleaseInfo} nativeReleaseInfo={nativeReleaseInfo}/>
</div>
<div data-tab="nav::examples" class="ui inverted text tab segment">
    <Examples github={github} repository={repository} releaseInfo={releaseInfo} commitInfo={commitInfo}/>
</div>
<div data-tab="nav::stats" class="ui inverted text tab segment">
    <Statistics endpoints={endpoints}/>
</div>
<div data-tab="nav::diag" class="ui inverted text tab fluid segment">
    <Diagnostics endpoints={endpoints} />
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

