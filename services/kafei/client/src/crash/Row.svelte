<script lang="ts">
    export let name: string | undefined;
    export let content: any | undefined;
</script>

<div class="ui row inverted">
    <div class="ui right aligned four wide column header inverted">
        <slot name="name">
            <h5 class="ui header inverted">{name}</h5>
        </slot>
    </div>
    <div class="ui ten wide column inverted">
        <slot name="content">
            {content ? content : ""}
        </slot>
    </div>
</div>
