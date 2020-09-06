<script lang="ts">
    import Crash from './Crash.svelte';
    import Report from './Report.svelte';
    import { onMount } from 'svelte';
    import type { DiagnosticState } from './States';

    export let state: DiagnosticState;
</script>

<div class="ui inverted top attached tabular menu">
    <a class="ui item active" data-tab="diag::crash">Crashes</a>
    <a class="ui item" data-tab="diag::report">Reports</a>
</div>

<div data-tab="diag::crash" class="ui inverted bottom attached tab segment active">
{#if state.crashes}
    {#each state.crashes as crash, i}
        <Crash
            state={crash}
            loadState={crash.state}
        />
    {/each}
{:else}
    <div class="ui active dimmer">
        <div class="ui loader"></div>
    </div>
{/if}
</div>

<div data-tab="diag::report" class="ui inverted bottom attached tab segment">
{#if state.reports}
    <!-- {#each state.reports as report, i (report.data.reportId)}
        <Report
            report={report.data}
            endpoints={state.endpoints}
            alternate={i % 2 == 0}
            authState={state.auth} />
    {/each} -->
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

