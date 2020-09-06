<script lang="ts">
    import Group from './crash/Group.svelte';
    import Code from './Code.svelte';
    import ReportView from './crash/ReportView.svelte';
    import Icon from './Icon.svelte';
    import Button from './Button.svelte';
    import {onMount} from 'svelte';
    import type { CrashState } from './States';
    
    onMount(() => {
        feather.replace();
    });
    
    export let state: CrashState;
    export let loadState: string;

    let container;

    //     if(!errored)
    //     {
    //         fullInfo = info;
    //         stdout = out;
    //         stderr = err;

    //         logErrorDetected = stderr.search('exception encountered') >= 0;
    //         if(logErrorDetected)
    //         {
    //             const exceptStart = stderr.search('exception encountered');
    //             logException = stderr.substr(exceptStart, stderr.search('dumping stacktrace') - exceptStart);
    //         }
    //     }
    // }
</script>

<div class="ui inverted container fluid crash-row">
    <a class="ui inverted container fluid" on:click={() => {
                                    window.$(container).toggleClass("active");
                                    state.expand();
            }}>
        <div class="ui inverted fluid container preview-item" style="background-color: {state.backgroundColor} !important;">
            <b>{state.data.crashId} - exited with {state.data.exitCode} - {new Date(state.data.submitTime).toGMTString()}</b>
            <i class="icon large chevron down"></i>
        </div>
    </a>
    <div class="ui inverted crash-item container" style="background-color: {state.backgroundColor} !important;" bind:this={container}>
        {#if state.logError}
            <div class="ui container centered">
                <span class="center aligned">Something went wrong</span>
            </div>
        {:else if loadState == 'loading'}
            <div class="ui active inline centered loader"></div>
        {:else if loadState == 'loaded'}
            {#if state.auths.loggedIn}
            <Group icon="archive" headerName="Manage">
                <Button label="Delete" onclick={state.delete} icon="trash-2" color="red" />
            </Group>
            {/if}
            <ReportView state={state.reportView} />
            <Group icon="file-text" headerName="Crash log">
            </Group>
            {#if state.logException}
            <div class="ui segment blue inverted top attached">
                <p class="flex-centered">
                    <Icon icon="info" /><b>Likely culprit:</b>
                </p>
                {#each state.logException.split('\n') as line}
                    <p>{line}</p>
                {/each}
            </div>
            {:else}
            <div class="ui segment orange inverted top attached flex-centered-important">
                <Icon icon="alert-triangle"/> Crash was not automatically detected!
            </div>
            {/if}
            {#if state.stack.code == 200 && state.stack.data.length > 0}
            <Group icon="file-text" headerName="Stacktrace">
                <div class="ui segment left aligned inverted stack-segment">
                    <Code lang="cpp">
                        {#each state.stack.data as frame}
                            {frame.frame.startsWith('void ') ? '' : 'auto '}{frame.ip + ' ' + 
                                (frame.frame.indexOf('(') !== -1 ? 
                                    frame.frame : 
                                    frame.frame + '(...)')}
                            {'\n'}
                        {/each}
                    </Code>
                </div>
            </Group>
            {/if}
            {#if state.stdout.code == 200}
            <div class="ui segment left aligned inverted log-segment">
                {#each state.stdout.data.split('\n') as line}
                    <p>{line}</p>
                {/each}
            </div>
            {/if}
            {#if state.stderr.code == 200}
            <div class="ui segment left aligned inverted log-segment">
                {#each state.stderr.data.split('\n') as line}
                    <p>{line}</p>
                {/each}
            </div>
            {/if}
            <div class="ui segment left aligned inverted log-segment">
                <p>Exited with {state.data.exitCode}</p>
            </div>
            <div style="margin-bottom: 2em;"></div>
        {:else if loadState == 'unloaded'}
            [unloaded]
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

