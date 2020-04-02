<script>
    import Icon from './Icon.svelte';

    export let icon;
    export let size = 24;

    export let color = "white";
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

