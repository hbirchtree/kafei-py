<script>
    import Navbar from './Navbar.svelte';
    import Home from './Home.svelte';
    import Statistics from './Statistics.svelte';
    import Examples from './Examples.svelte';
    import Footer from './Footer.svelte';
    import * as j from 'jquery';

    import {onMount} from 'svelte';
	
    export let navLinks = [
            {name: "Home", target: "nav::home", icon: "home"},
            {name: "Examples", target: "nav::examples", icon: "box"},
            {name: "Statistics", target: "nav::stats", icon: "chart pie"},
            {name: "Diagnostics", target: "nav::diag", icon: "archive"}
    ];
    export let extLinks = [
            {name: "Old diagnostics", target: "https://birchy.dev/diag-semantic.html"}
    ];
    export let github;
    export let repository;

    export let releaseInfo = null;
    export let imguiReleaseInfo = null;
    export let nativeReleaseInfo = null;
    export let commitInfo = null;

    export let endpoints;

    async function get_resource(source) {
        return fetch(endpoints.data + source)
            .then((content) => {
                return content.json(); 
            })
            .then((content) => {
                console.log(content.data);
                return content.data;
            }).catch((err) => {
                console.err(err);
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
    });

</script>

<link rel="stylesheet" type="text/css" href="semantic/semantic.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/container.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/header.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/menu.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/modal.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/tab.min.css">

<Navbar links={navLinks} externals={extLinks} github={github}/>

<div data-tab="nav::home" class="ui inverted text tab segment active">
    <Home github={github} endpoints={endpoints} releaseInfo={releaseInfo} imguiReleaseInfo={imguiReleaseInfo} nativeReleaseInfo={nativeReleaseInfo}/>
</div>
<div data-tab="nav::examples" class="ui inverted text tab segment">
    <Examples github={github} repository={repository} releaseInfo={releaseInfo} commitInfo={commitInfo}/>
</div>
<div data-tab="nav::stats" class="ui inverted text tab segment">
    <Statistics endpoints={endpoints}/>
</div>
<div data-tab="nav::diag" class="ui inverted text tab segment">
    Diagnostics
</div>


<Footer/>

<style>
    div.segment {
        max-width: 60em;
        margin-left: auto;
        margin-right: auto;
    }
</style>

<link href="https://fonts.googleapis.com/css?family=Ubuntu+Mono:400,400i,700&amp;subset=latin-ext" rel="stylesheet">

