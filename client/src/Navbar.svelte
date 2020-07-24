<script>
    import Icon from './Icon.svelte';
    import Button from './Button.svelte';

    export let links;
    export let externals;
    export let github;
    export let authLinks;
    export let authState;

    let mobileMenu;
    let authDropdown;

    function handleAuthClick() {
        window.$(authDropdown).toggleClass('displayed');
    }
</script>

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
        <a class="ui tiny image" style="height: 80px;">
            <img src="{github.img}" class="ui tiny circular image dootable {authState.loggedIn ? 'logged-in' : ''}" on:click={handleAuthClick}>

            <div class="ui container auth-menu">
                <div class="ui container auth-content displayed" style="padding: 1em;" bind:this={authDropdown}>
                    <div class="ui container dropdown-arrow">
                    </div>
                    {#if authState.loggedIn}
                        <a class="ui teal image label" style="margin-bottom: 2em;">
                            <img />
                            Signed in as {authState.username}
                        </a>
                    {/if}
                    {#each authLinks as link}
                        <Button icon={link.icon} label={link.text} color={link.color} onclick={link.action} margin=0/>
                    {/each}
                </div>
            </div>
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
                <Icon icon="{link.icon}"/><b>{link.name}</b>
            </a>
        {/each}
        {#each externals as link (link.name)}
            <a class="ui item" 
                href="{link.target}" 
                on:click={() => window.$(mobileMenu).removeClass('active')}>
                <Icon icon="external-link"/><b>{link.name}</b>
            </a>
        {/each}
    </div>
</div>

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
    a.tiny.image {
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
    .ui.dootable {
        transition: filter linear 0.2s;
    }
    .ui.dootable:active {
        filter: brightness(0.5);
    }
    img.ui {
        transition: border-color linear 0.5s, filter linear 0.2s !important ;
        border-color: #ff4a4a;
        border-style: solid;
    }
    img.ui.logged-in {
        border-color: #4aff4a;
    }
    .auth-menu {
        position: relative;
        display: inline-block;
    }
    .auth-content {
        position: absolute;
        filter: drop-shadow(10px 10px 4px rgba(0, 0, 10, 1));
        border-radius: 10px;

        left: -100px;
        z-index: 100;
        display: flex;
        flex-direction: column;
        padding: 10px 2px;
        min-width: 200px;
    }
    .auth-content:not(.displayed) {
        display: none;
    }
    .dropdown-arrow {
        position: absolute;
        top: -12px;
        left: 115px;
        background-color: white;
        z-index: -1;
        width: 50px;
        height: 50px;
        transform: rotate(45deg);
        border-radius: 5px;
    }
</style>

