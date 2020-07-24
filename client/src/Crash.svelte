<script>
    import Group from './crash/Group.svelte';
    import Code from './Code.svelte';
    import ReportView from './crash/ReportView.svelte';
    import Icon from './Icon.svelte';
    import Button from './Button.svelte';
    import {onMount} from 'svelte';
    
    onMount(() => {
        feather.replace();
    });
    
    export let endpoints;
    export let crash;
    export let alternate;
    export let backgroundColor = alternate ? "#202035" : "#151530";

    export let authState;

    let errored = false;

    let container;

    let fullInfo = null;
    let noProfile = false;
    let stdout = null;
    let stderr = null;
    let logErrorDetected = true;
    let logException;
    let stack = null;

    async function delete_crash() {
        authState.fetch('/v2/crash/' + crash.data.crashId, 'DELETE')
    }

    async function get_full_crash() {
        if(fullInfo !== null || errored)
            return;
        let info = await fetch(endpoints.data + crash.links[4].uri)
                    .then((content) => {return content.json();})
                    .catch(e => { errored = true; });
        const out = await fetch(endpoints.data + crash.links[1].uri)
                    .then((content) => {return content.text();})
                    .catch(e => { errored = true; console.log(e);});
        const err = await fetch(endpoints.data + crash.links[2].uri)
                    .then((content) => {return content.text();})
                    .catch(e => { errored = true; console.log(e);});
        const stack_ = await fetch(endpoints.data + crash.links[5].uri)
                    .then((content) => {return content.text();})
                    .catch(e => {console.log(e);});

        if(info.code && info.code !== 200)
            errored = true;

        if(errored && !out.code && !err.code)
        {
            errored = false;
            noProfile = true;
            info = {};
        }

        if(stack_)
        {
            let parsedStack = null;
            try {
                parsedStack = JSON.parse(stack_);
            } catch(e) {
                parsedStack = JSON.parse(stack_ + "{}]");
            }
            stack = parsedStack;
        }

        if(!errored)
        {
            fullInfo = info;
            stdout = out;
            stderr = err;

            logErrorDetected = stderr.search('exception encountered') >= 0;
            if(logErrorDetected)
            {
                const exceptStart = stderr.search('exception encountered');
                logException = stderr.substr(exceptStart, stderr.search('dumping stacktrace') - exceptStart);
            }
        }
    }
</script>

<div class="ui inverted container fluid crash-row">
    <a class="ui inverted container fluid" on:click={() => { 
                                    window.$(container).toggleClass("active");
                                    get_full_crash();
            }}>
        <div class="ui inverted fluid container preview-item" style="background-color: {backgroundColor} !important;">
            <b>{crash.data.crashId} - exited with {crash.data.exitCode} - {new Date(crash.data.submitTime).toGMTString()}</b>
            <i class="icon large chevron down"></i>
        </div>
    </a>
    <div class="ui inverted crash-item container" style="background-color: {backgroundColor} !important;" bind:this={container}>
        {#if errored}
            <div class="ui container centered"><span class="center aligned">Something went wrong</span></div>
        {:else if fullInfo !== null}
            {#if authState.loggedIn}
            <Group icon="archive" headerName="Manage">
                <Button label="Delete" onclick={delete_crash} icon="trash-2" color="red" />
            </Group>
            {/if}
            {#if !noProfile}
                <ReportView report={fullInfo} summary={crash.data} />
            {/if}
            <Group icon="file-text" headerName="Crash log">
            </Group>
            {#if !logErrorDetected}
            <div class="ui segment orange inverted top attached flex-centered-important">
                <Icon icon="alert-triangle"/> Crash was not automatically detected!
            </div>
            {:else}
            <div class="ui segment blue inverted top attached">
                <p class="flex-centered">
                    <Icon icon="info" /><b>Likely culprit:</b>
                </p>
                {#each logException.split('\n') as line}
                    <p>{line}</p>
                {/each}
            </div>
            {/if}
            {#if stack && stack.length > 0}
            <Group icon="file-text" headerName="Stacktrace">
                <div class="ui segment left aligned inverted stack-segment">
                    <Code lang="cpp">
                        {#each stack as frame}
                            {#if frame.frame}
                                {frame.frame.startsWith('void ') ? '' : 'auto '}{frame.frame.indexOf('(') !== -1 ? frame.frame : frame.frame + '(...)'}{'\n'}
                            {/if}
                        {/each}
                    </Code>
                </div>
            </Group>
            {/if}
            <div class="ui segment left aligned inverted log-segment">
                {#each stdout.split('\n') as line}
                    <p>{line}</p>
                {/each}
            </div>
            <div class="ui segment left aligned inverted log-segment">
                {#each stderr.split('\n') as line}
                    <p>{line}</p>
                {/each}
            </div>
            <div class="ui segment left aligned inverted log-segment">
                <p>Exited with {crash.data.exitCode}</p>
            </div>
            <div style="margin-bottom: 2em;"></div>
        {:else}
            <div class="ui active inline centered loader"></div>
        {/if}
    </div>
</div>

<style>
    div.ui.container:not(.crash-item), a.ui.container {
        min-height: 5em;
        margin-left: 0 !important;
        margin-right: 0 !important;
    }
    .preview-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .preview-item b {
        margin-left: 0.5em;
    }
    .crash-item {
        overflow: hidden;
        margin-left: auto !important;
        margin-right: auto !important;
        transition: height linear 0.2s !important;
    }
    .crash-item:not(.active) {
        height: 0 !important;
    }
    .log-segment {
        background-color: black !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
    }
    .log-segment p {
        margin-bottom: 0 !important;
    }
    .stack-segment {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
    }
    .stack-segment p:nth-child(even) {
        background-color: rgb(32, 32, 53) !important;
    }
</style>

