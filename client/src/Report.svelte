<script>
    import ReportView from './crash/ReportView.svelte';
    import Group from './crash/Group.svelte';
    import Row from './crash/Row.svelte';
    import Icon from './Icon.svelte';
    import {onMount} from 'svelte';
    
    onMount(() => {
        feather.replace();
    });
    
    export let endpoints;
    export let report;
    export let alternate;
    export let backgroundColor = alternate ? "#202035" : "#151530";

    let errored = false;

    let container;

    let fullInfo = null;

    async function get_full_report() {
        if(fullInfo !== null || errored)
            return;
        const info = await fetch(endpoints.data + report.links[0].uri)
                    .then((content) => {return content.json();})
                    .catch(e => { errored = true; });

        if(info.code && info.code !== 200)
            errored = true;

        if(!errored)
            fullInfo = info.data;
    }
</script>

<div class="ui inverted container fluid report-row">
    <a class="ui inverted container fluid" on:click={() => { 
                                    window.$(container).toggleClass("active");
                                    get_full_report();
            }}>
        <div class="ui inverted fluid container preview-item" style="background-color: {backgroundColor} !important;">
            <b>{report.data.reportId} - {report.data.system ? report.data.system.split(' running ')[0] : "Unknown"} - {new Date(report.data.submitTime).toGMTString()}</b>
            <b></b>
            <i class="icon large chevron down"></i>
        </div>
    </a>
    <div class="ui inverted report-item container" style="background-color: {backgroundColor} !important;" bind:this={container}>
        {#if errored}
            <div class="ui container centered"><span class="center aligned">Something went wrong</span></div>
        {:else if fullInfo !== null}
            <ReportView report={fullInfo} summary={report.data} />
            <Group icon="file-text" headerName="Raw format">
                <Row name="raw report download">
                    <a href="{report.links[2].uri}" slot="content">
                        <div class="ui label inverted flex-centered-important">
                            <Icon icon="download-cloud"/> Download
                        </div>
                    </a>
                </Row>
                <Row name="view report">
                    <a href="https://trace.birchy.dev?source=https://api.birchy.dev/{report.links[2].uri}" slot="content">
                        <div class="ui label inverted flex-centered-important">
                            <Icon icon="external-link"/> View
                        </div>
                    </a>
                </Row>
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

