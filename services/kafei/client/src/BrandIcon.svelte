<script lang="ts">
    import Icon from './Icon.svelte';
    import type { Color } from './Types';

    export let icon: string;
    export let size: number = 24;

    export let color: Color = "white";
</script>

{#if icon}
    <div style="width: {size}px; 
                    height: {size}px; 
                    background-color: {color}; 
                    -webkit-mask: url(https://unpkg.com/simple-icons@latest/icons/{icon}.svg) no-repeat center;
                    mask: url(https://unpkg.com/simple-icons@latest/icons/{icon}.svg) no-repeat center;">
    </div>
{:else}
    <Icon size={size} icon="box" />
{/if}

