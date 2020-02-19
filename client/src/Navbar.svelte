<script>
    export let links;
    export let github;
</script>

<style>
    a {
        color: white;
    }
    .ui.menu .item {
        transition: background-color 0.5s;
    }
    .ui.menu, .ui.item, .ui.container {
        background-color: royalblue !important;
        transition: background-color 0.1s;
    }
    .ui.active.item {
        background-color: midnightblue !important;
    }
    a.image {
        margin-left: auto;
        margin-right: 0;
    }
</style>

<div class="ui inverted menu">
    <div id="navbar" class="ui container">
        {#each links as link (link.target)}
            <a data-tab="{link.target}" class="item">
                <h1 class="ui">{link.name}</h1>
            </a>
        {/each}
        <a href="{github.link}" class="ui tiny circular image">
            <img src="{github.img}">
        </a>
    </div>
</div>
