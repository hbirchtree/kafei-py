<script>
    import Icon from './Icon.svelte';
    import {onMount} from 'svelte';
    
    onMount(() => {
        feather.replace();
    });
</script>

<style>
    div {
        background-color: #191970 !important;
    }
</style>

<div class="ui inverted vertical footer segment centered flex-centered">
    <span>source can be found over at</span>
    <a href="https://github.com/hbirchtree/kafei-py" class="flex-centered">
        <Icon icon="github" rounded=true />
        <span>github</span>
    </a>
</div>
