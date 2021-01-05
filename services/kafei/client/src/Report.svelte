<script lang="ts">
    import ReportView from './crash/ReportView.svelte';
    import Group from './crash/Group.svelte';
    import Row from './crash/Row.svelte';
    import Icon from './Icon.svelte';
    import Button from './Button.svelte';
    import {onMount} from 'svelte';
    import type { ReportState } from './States';
    
    onMount(() => {
        feather.replace();
    });
    
    export let state: ReportState;

    let errored = false;

    let container;

    let fullInfo = null;

    // async function get_full_report() {
    //     if(fullInfo !== null || errored)
    //         return;
    //     const info = await fetch(state.endpoints.data + report.links[0].uri)
    //                 .then((content) => {return content.json();})
    //                 .catch(e => { errored = true; });

    //     if(info.code && info.code !== 200)
    //         errored = true;

    //     if(!errored)
    //         fullInfo = info.data;
    // }

    async function delete_report() {
        authState.fetch('/v2/reports/' + report.data.reportId, 'DELETE');
    }
    function raw_report() {
        console.log("hello");
        window.open(report.links[2].uri, '_blank');
    }
    function view_report() {
        window.open("https://trace.birchy.dev?source=https://api.birchy.dev/" + report.links[2].uri, '_blank');
    }
</script>

<div class="ui inverted container fluid report-row">
    <a class="ui inverted container fluid" on:click={() => { 
                                    window.$(container).toggleClass("active");
                                    state.expand();
            }}>
        <div class="ui inverted fluid container preview-item" style="background-color: {backgroundColor} !important;">
            <b>{report.data.reportId} - {state.data.system ? state.data.system.split(' running ')[0] : "Unknown"} - {new Date(state.data.submitTime).toGMTString()}</b>
            <b></b>
            <i class="icon large chevron down"></i>
        </div>
    </a>
    <div class="ui inverted report-item container" style="background-color: {backgroundColor} !important;" bind:this={container}>
        {#if errored}
            <div class="ui container centered"><span class="center aligned">Something went wrong</span></div>
        {:else if fullInfo !== null}
            {#if authState.loggedIn}
                <Group icon="archive" headerName="Manage">
                    <Button label="Delete" onclick={delete_report} icon="trash-2" color="red" />
                </Group>
            {/if}
            <ReportView report={fullInfo} summary={report.data} />
            <Group icon="file-text" headerName="Raw format">
                <Button label="Download raw" icon="download-cloud" 
                    onclick={raw_report} 
                    />
                <Button label="View" icon="external-link" 
                    onclick={view_report} 
                    />
            </Group>
        {:else}
            <div class="ui active inline centered loader"></div>
        {/if}
    </div>
</div>

<style>
    div.ui.container:not(.report-item), a.ui.container {
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
    .report-item {
        overflow: hidden;
        margin-left: 0 !important;
        margin-right: 0 !important;
        transition: height linear 0.2s !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }
    .report-item:not(.active) {
        height: 0 !important;
    }
</style>

