<script lang="ts">
    import Code from './Code.svelte';
    import UpdateBubble from './UpdateBubble.svelte';
    import Badge from './Badge.svelte';
    import type { GithubProfile, GithubRelease } from './Types';

    export let github: GithubProfile;
    export let releases: GithubRelease[];
</script>

<UpdateBubble userInfo={github}>
    <p><b>username</b> hbirchtree</p>
    All my code is on GitHub
</UpdateBubble>

<div class="ui container inverted">
    {#each releases as release}
        <Badge
            repository={release.repository.full_name}
            releaseInfo={release}
        />
    {/each}
    <!-- <Badge repository="hbirchtree/coffeecutie-imgui" releaseInfo={imguiReleaseInfo} />
    <Badge repository="hbirchtree/native-library-bundle" releaseInfo={nativeReleaseInfo} /> -->
</div>

<h2 class="ui header">Getting started</h2>

<p>
    Get started by cloning the source code
</p>

<Code>
    git clone https://github.com/hbirchtree/coffeecutie.git
</Code>

<p>
    If all your compilers and CMake are in order, you should be able to use the quick-build option as such
</p>

<Code>
    BUILD_MODE=bare ./cb quick-build [ubuntu.amd64, fedora.amd64, osx, ios.x86_64]
</Code>

<p>
    Additionally, if you don't want to set up compilers and etc., and you have Docker installed, you can go ahead with
</p>

<Code>
    ./cb quick-build [ubuntu.amd64, fedora.amd64]
</Code>

