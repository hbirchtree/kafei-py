<script>
    export let icon;
    export let headerName;
</script>

<div class="ui container inverted">
    <h4 class="ui horizontal divider header inverted">
        <i class="{icon} icon"></i>
        {headerName}
    </h4>
    <div class="ui divided internally celled centered grid inverted">
        <slot>
        </slot>
    </div>
</div>
