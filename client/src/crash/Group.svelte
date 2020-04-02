<script>
    import Icon from '../Icon.svelte';

    export let icon;
    export let headerName;
</script>

<div class="ui container inverted">
    <h4 class="ui horizontal divider header inverted">
        <span class="flex-centered">
            <Icon icon="{icon}"/>
            {headerName}
        </span>
    </h4>
    <div class="ui divided internally celled centered grid inverted">
        <slot>
        </slot>
    </div>
</div>
