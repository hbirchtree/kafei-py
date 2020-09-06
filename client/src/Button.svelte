<script lang="ts">
    import Icon from './Icon.svelte';
    import type { Color } from './Types';

    export let icon: string;
    export let label: string;
    export let color: Color = "blue";
    export let onclick: () => Promise<void> = async () => {};
    export let margin: string = '1em';
</script>

<button on:click={onclick} class="ui {color} button flex-centered-important" style="margin: {margin};">
    <Icon icon={icon} /> {label}
</button>
