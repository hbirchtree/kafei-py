<style>
    .update-bubble {
        position: relative;
        display: flex;
        overflow: hidden;
        align-items: stretch;
        margin: 0 0.2em;

        filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.4));
        border-radius: 100px;
    }
    .bubble-image {
        border-radius: 100px;
        min-width: 5em;
        min-height: 5em;

        display: flex;
        align-items: stretch;
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
    }
    .update-bubble:hover {
        background-color: #117;
    }
    .update-bubble:active {
        background-color: #115;
    }
</style>

<script>
    export let userInfo;
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

