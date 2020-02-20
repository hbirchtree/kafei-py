<script>
    import UpdateBubble from './UpdateBubble.svelte';

    export let github;
    export let repository;
    export let releaseInfo;
    export let commitInfo;
</script>

{#if releaseInfo !== null && commitInfo !== null }
    <UpdateBubble userInfo={github}>
        <p>
            <b>updated</b> {commitInfo.head_commit.timestamp} 
            <b>hash</b> {commitInfo.head_commit.id.substr(0, 10)} 
        </p>
        <p>
            <b>branch</b> {commitInfo.ref}
        </p>
        <div>
            {@html commitInfo.head_commit.message.split('\n').join('</br>')}
        </div>
    </UpdateBubble>
{:else}
    <UpdateBubble userInfo={github}>
        <div class="ui active dimmer">
            <div class="ui loader"></div>
        </div>
    </UpdateBubble>
{/if}

<h2 class="ui header">Downloadable examples</h2>

<p>
    Every release generates downloadable binaries for Linux and macOS platforms, found here:
</p>

<ul>
    {#if releaseInfo !== null}
        <li><a href="{releaseInfo.release.html_url}">
            <i class="big icon box"></i>Latest release ({releaseInfo.release.tag_name})</a>
        </li>
    {:else}
        <div class="ui active dimmer">
            <div class="ui loader"></div>
        </div>
    {/if}
</ul>

