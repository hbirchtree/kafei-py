<script lang="ts">
	import type { GithubRepository, GithubProfile, GithubRelease, GithubCommit } from './Types';
    import UpdateBubble from './UpdateBubble.svelte';
    import Icon from './Icon.svelte';

    export let github: GithubProfile;
    export let releaseInfo: GithubRelease | undefined;
    export let commitInfo: GithubCommit | undefined;
</script>

{#if releaseInfo && commitInfo}
    <UpdateBubble userInfo={github}>
        <p>
            <b>updated</b> {(commitInfo && commitInfo.head_commit) ? commitInfo.head_commit.timestamp : "[none]"} 
            <b>hash</b> {(commitInfo && commitInfo.head_commit) ? commitInfo.head_commit.id.substr(0, 10) : "0000"} 
        </p>
        <p>
            <b>branch</b> {commitInfo.ref}
        </p>
        <div>
            {@html (commitInfo && commitInfo.head_commit) ? commitInfo.head_commit.message.split('\n').join('</br>') : ""}
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
    {#if releaseInfo}
        <li class="flex-centered"><a href="{(releaseInfo && releaseInfo.release) ? releaseInfo.release.html_url : ""}" class="flex-centered">
            <Icon icon="package" size=24/>Latest release ({(releaseInfo && releaseInfo.release) ? releaseInfo.release.tag_name : ""})</a>
        </li>
    {:else}
        <div class="ui active dimmer">
            <div class="ui loader"></div>
        </div>
    {/if}
</ul>

