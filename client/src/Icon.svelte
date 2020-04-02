<script>
    import {onMount} from 'svelte';
    onMount(() => {
        feather.replace();
    });

    export let icon;
    export let size = 20;
    export let rounded = false;
    export let fgColor = "white";
    export let bgColor = "rgb(64, 105, 225)";

    export let spacing = 4;
</script>

{#if rounded}
    <span style="border-radius: 100px; background-color: {bgColor}; color: {fgColor}; padding: 4px; width: {size + 8}px; height: {size + 8}px; margin-left: {spacing}px; margin-right: {spacing}px;">
        <i data-feather={icon} style="width: {size}px; height: {size}px;"></i>
    </span>
{:else}
    <i data-feather={icon} style="width: {size}px; height: {size}px; margin-left: {spacing}px; margin-right: {spacing}px;"></i>
{/if}
