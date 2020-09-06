<style>
    .update-bubble {
        position: relative;
        display: flex;
        overflow: hidden;
        align-items: flex-start;
        margin: 0 0.2em;

        filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.4));
        border-radius: 3em;
    }
    .bubble-image {
        border-radius: 3em;
        min-width: 5em;
        min-height: 5em;

        display: flex;
        align-items: center;
        transition: filter linear 0.2s;
    }
    .bubble-image:active {
        filter: brightness(0.5);
    }
    .bubble-listing {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        
        justify-content: flex-start;
        margin: 0.5em 1em;
        text-decoration: none;
        overflow: hidden;
    }

    .update-bubble {
        background-color: #117;
        transition: background-color linear 0.1s;
    }
    .update-bubble:hover {
        background-color: #117;
    }
    .update-bubble:active {
        background-color: #115;
    }
</style>

<script lang="ts">
    import type { GithubProfile } from "./Types";
    export let userInfo: GithubProfile;
</script>

<div class="update-bubble">
    <a class="bubble-image" href="{userInfo.link}">
        <img class="bubble-image" src="{userInfo.img}">
    </a>
    <div class="bubble-listing">
        <slot>
            Hello World!
        </slot>
    </div>
</div>
