<script>
    import Crash from './Crash.svelte';
    import Report from './Report.svelte';

    export let endpoints;

    let crashes;
    let reports;

    function reload() {
        fetch(endpoints.data + '/v2/crash')
            .then((content) => {
                return content.json();
            })
            .then((content) => {
                crashes = content.data.reverse();
            });
        fetch(endpoints.data + '/v2/reports')
            .then((content) => {
                return content.json();
            })
            .then((content) => {
                reports = content.data.reverse();
            });
    }
    reload();

    let listener = new Paho.MQTT.Client("birchy.dev", 8083, "/");

    listener.onMessageArrived = (message) => {
        crashes = null;
        reports = null;
        reload();
    };
    let listenerOptions = { timeout: 3, onSuccess: () => {
        console.log("Connected to birchy.dev");
        listener.subscribe("public/diagnostics/#");
    }};
    listener.connect(listenerOptions);
</script>

<div class="ui inverted top attached tabular menu">
    <a class="ui item active" data-tab="diag::crash">Crashes</a>
    <a class="ui item" data-tab="diag::report">Reports</a>
</div>

<div data-tab="diag::crash" class="ui inverted bottom attached tab segment active">
{#if crashes}
    {#each crashes as crash, i (crash.data.crashId)}
        <Crash crash={crash} endpoints={endpoints} alternate={i % 2 == 0} />
    {/each}
{:else}
    <div class="ui active dimmer">
        <div class="ui loader"></div>
    </div>
{/if}
</div>

<div data-tab="diag::report" class="ui inverted bottom attached tab segment">
{#if reports}
    {#each reports as report, i (report.data.reportId)}
        <Report report={report} endpoints={endpoints} alternate={i % 2 == 0} />
    {/each}
{:else}
    <div class="ui active dimmer">
        <div class="ui loader"></div>
    </div>
{/if}
</div>

<style>
    div.ui.segment {
        min-height: 30em;
    }
    div.ui.tab.active {
        display: flex;
        align-items: stretch;
        flex-direction: column;
    }
</style>

