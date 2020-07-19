<script>
    import { onMount } from 'svelte';

    export let lang = "bash";

    let codeTag;

    onMount(async () => {
        hljs.highlightBlock(codeTag);
    });
//        color: white;
//        background-color: rgba(255, 255, 255, 0.1);
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
