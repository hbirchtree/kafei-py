<script lang="ts">
    import {onMount} from 'svelte';
    import type { Color } from './Types';
    
    export let icon: string;
    export let size: number = 20;
    export let rounded: boolean = false;
    export let fgColor: string = "white";
    export let bgColor: string = "rgb(64, 105, 225)";

    export let spacing: number = 4;

    onMount(() => {
        feather.replace();
    });

</script>

{#if rounded}
    <span style="border-radius: 100px; background-color: {bgColor}; color: {fgColor}; padding: 4px; width: {size + 8}px; height: {size + 8}px; margin-left: {spacing}px; margin-right: {spacing}px;">
        <i data-feather={icon} style="width: {size}px; height: {size}px;"></i>
    </span>
{:else}
    <i data-feather={icon} style="width: {size}px; height: {size}px; margin-left: {spacing}px; margin-right: {spacing}px;"></i>
{/if}
