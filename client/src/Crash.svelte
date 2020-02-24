<script>
    import Group from './crash/Group.svelte';
    import ReportView from './crash/ReportView.svelte';
    
    export let endpoints;
    export let crash;
    export let alternate;
    export let backgroundColor = alternate ? "#202035" : "#151530";

    let errored = false;

    let container;

    let fullInfo = null;
    let noProfile = false;
    let stdout = null;
    let stderr = null;
    let logErrorDetected = true;
    let logException;

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

        if(info.code && info.code !== 200)
            errored = true;

        if(errored && !out.code && !err.code)
        {
            errored = false;
            noProfile = true;
            info = {};
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
            <b>{crash.data.crashId}</b>
            <i class="icon large chevron down"></i>
        </div>
    </a>
    <div class="ui inverted crash-item container" style="background-color: {backgroundColor} !important;" bind:this={container}>
        {#if errored}
            <div class="ui container centered"><span class="center aligned">Something went wrong</span></div>
        {:else if fullInfo !== null}
            {#if !noProfile}
                <ReportView report={fullInfo} />
            {/if}
            <Group icon="bug" headerName="Crash log">
            </Group>
            {#if !logErrorDetected}
            <div class="ui segment orange inverted top attached">
                Crash was not automatically detected!
            </div>
            {:else}
            <div class="ui segment blue inverted top attached">
                <p><b>Likely culprit:</b></p>
                {#each logException.split('\n') as line}
                    <p>{line}</p>
                {/each}
            </div>
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
</style>

