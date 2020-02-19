<script>
    import Navbar from './Navbar.svelte';
    import Home from './Home.svelte';
    import Statistics from './Statistics.svelte';
    import Footer from './Footer.svelte';
    import * as j from 'jquery';

    import {onMount} from 'svelte';
	
    export let navLinks = [
            {name: "Home", target: "nav::home"},
            {name: "Examples", target: "nav::examples"},
            {name: "Statistics", target: "nav::stats"},
            {name: "Diagnostics", target: "nav::diag"}
    ];
    export let github = {link: "https://github.com/hbirchtree", img: "https://avatars3.githubusercontent.com/u/6828070?s=80&v=4"};
    export let endpoints = {
            data: "https://api.birchy.dev",
            profiler: "https://coffee.birchy.dev",
            crash: "https://crash.birchy.dev"
    };

    onMount(async () => {
        window.$('.ui.menu .item').tab();
    });
</script>

<link rel="stylesheet" type="text/css" href="semantic/semantic.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/container.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/header.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/menu.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/modal.min.css">
<link rel="stylesheet" type="text/css" href="semantic/components/tab.min.css">

<Navbar links={navLinks} github={github}/>

<div data-tab="nav::home" class="ui inverted text tab segment active">
    <Home github={github} endpoints={endpoints}/>
</div>
<div data-tab="nav::examples" class="ui inverted text tab segment">
    Examples
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

