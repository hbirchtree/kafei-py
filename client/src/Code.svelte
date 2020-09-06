<script lang="ts">
    import { onMount } from 'svelte';

    export let lang: string = "bash";

    let codeTag: HTMLElement;

    onMount(async () => {
        hljs.highlightBlock(codeTag);
    });
</script>
<style>
    code {
        padding: 1em;
        padding-left: 3em;
        margin: 0.5em;

        box-shadow: inset 0 0 5px black;
        overflow-x: overlay;
        flex-grow: 1;
        white-space: pre-wrap;
    }
    pre {
        flex-grow: 1;
    }
    div, pre {
        display: flex;
        justify-content: stretch;
    }
    div {
        margin: 0 0 1em 1em;
    }
</style>

<div>
    <pre>
        <code bind:this={codeTag} class="{lang}">
            <slot>
            </slot>
        </code>
    </pre>
</div>
