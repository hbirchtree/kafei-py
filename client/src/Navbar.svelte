<script>
    export let links;
    export let externals;
    export let github;

    let mobileMenu;
</script>

<style>
    a {
        color: white;
    }
    .ui.menu {
    }
    .ui.menu .item {
        transition: background-color linear 0.5s;
    }
    .ui.menu, .ui.item, .ui.container {
        background-color: royalblue !important;
        transition: background-color 0.1s;
    }
    .ui.item:active, .ui.item.active {
        background: solid midnightblue !important;
        background-color: midnightblue !important;
    }
    a.image {
        margin-left: auto;
        margin-right: 0;
    }

    .mobile {
        display: none !important;
    }

    @media screen and (max-width: 768px) {
        .desktop {
            display: none;
        }
        .mobile {
            display: flex !important;
        }
    }
    .ui.container.mobile-links {
        overflow: hidden;
        transition: height linear 0.5s !important;
    }
    .mobile-links.active {
        height: 360px;
    }
    .mobile-links:not(.active) {
        height: 0;
    }
    .ui.menu.mobile a.container {
        flex-direction: row;
        align-items: center;
        justify-content: center;
        height: 5em;
        margin-bottom: 0.2em;
    }
    .ui.menu.mobile a.container i {
        position: absolute;
        left: 0.2em;
        top: 0.2em;
    }
</style>

<div class="ui inverted menu desktop">
    <div class="ui container">
        {#each links as link (link.target)}
            <a data-tab="{link.target}" class="ui item">
                <h3>{link.name}</h3>
            </a>
        {/each}
        {#each externals as link (link.name)}
            <a class="ui item" href="{link.target}">
                <h3>{link.name} </h3><i style="margin-left: 0.4em;" class="icon external alternate"></i>
            </a>
        {/each}
        <a href="{github.link}" class="ui tiny circular image">
            <img src="{github.img}">
        </a>
    </div>
</div>

<div class="ui inverted vertical menu mobile fluid">
    <a class="ui container horizontal fluid" on:click={() => window.$(mobileMenu).toggleClass('active')}>
        <i style="color: white;" class="huge icon bars"></i> 
        <b>birchy.dev</b>
    </a>
    <div bind:this={mobileMenu} class="ui container mobile-links">
        {#each links as link (link.target)}
            <a class="ui item" 
                data-tab="{link.target}" 
                on:click={() => window.$(mobileMenu).removeClass('active')}>
                <i class="large icon {link.icon}"></i><b>{link.name}</b>
            </a>
        {/each}
        {#each externals as link (link.name)}
            <a class="ui item" 
                href="{link.target}" 
                on:click={() => window.$(mobileMenu).removeClass('active')}>
                <i class="large icon external alternate"></i><b>{link.name}</b>
            </a>
        {/each}
    </div>
</div>
