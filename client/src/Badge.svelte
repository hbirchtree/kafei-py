<script lang="ts">
import type { GithubRelease } from "./Types";


    export let repository: string;
    export let releaseInfo: GithubRelease;

    let repoBasename: string = repository.split('/')[1];
    let repoFlattened: string = repository.replace('/', '_');

    let badgeUrl = `https://img.shields.io/badge/dynamic/json?color=success&label=${repoBasename}&query=%24.data.release.tag_name&url=https%3A%2F%2Fapi.birchy.dev%2Fgithub%2FlatestRelease%2F${repoFlattened}`;
</script>

{#if releaseInfo && releaseInfo.release}
    <a href="https://github.com/{repository}/releases/{releaseInfo.release.tag_name}">
        <img src="{badgeUrl}" />
    </a>
{:else}
    <a href="https://github.com/{repository}/releases">
        <img src="{badgeUrl}" />
    </a>
{/if}
