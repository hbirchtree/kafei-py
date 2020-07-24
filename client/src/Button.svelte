<script>
    import Icon from './Icon.svelte';

    export let icon;
    export let label;
    export let color = "blue";
    export let onclick = () => {};
    export let margin = '1em';
</script>

<button on:click={onclick} class="ui {color} button flex-centered-important" style="margin: {margin};">
    <Icon icon={icon} /> {label}
</button>
