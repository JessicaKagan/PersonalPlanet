<script lang="ts">
    import RootMenu from "../root_menu.svelte";
    import { WorldControlsTools } from "../../../game/defines";

    import PhaserGame, { type TPhaserRef } from "../../../PhaserGame.svelte";

    //  References to the PhaserGame component (game and scene are exposed)
    let phaserRef: TPhaserRef = { game: null, scene: null};

    let {
        class: propsClass = ""
    } = $props()

    const selectTool = (tool: WorldControlsTools): void => {
        const canUseTools = phaserRef.scene?.scene.key === "Game";

        if (canUseTools) {
            // TODO: Figure out how to pass this information to the game scene,
            // with the intent of setting the current tool.
            // This information will eventually be used by event handlers.
        }
        
    }

</script>

<RootMenu class={propsClass}>
    <!-- FUTURE: We should consider sourcing different icons here, since emojis vary from platform to platform.
        These could either be images or SVGs. Potentially even a combination of the two. Material Symbols works well for the latter. -->
    <button class="controls" title="Query" aria-label="query" onclick={() => selectTool(WorldControlsTools.Query)}>🔍</button>
    <button class="controls" title="Draw" aria-label="draw" onclick={() => selectTool(WorldControlsTools.Draw)}>🖌️</button>
</RootMenu>

<style lang="scss">
    :global {
        .menu-container {
            // TODO: Figure out why the height isn't scaling based on the viewport size.
            // Once this is figured out, we can most likely remove the "top" rule.
            height: 80%;
            margin: 0 auto;
            overflow-y: scroll;
            position: absolute;
            top: 64px;

            // The menu is intended to be responsive... to a point.
            // A minimum width keeps the container from getting too small in the short term.
            width: calc(100% * 1/12);
            min-width: 128px;
            padding: 16px 0;

            // The menu is filled with a grid of buttons - 2 columns per row until we run out of buttons to render.
            display: grid;
            grid-template-columns: auto auto;
            grid-auto-rows: minmax(32px, 64px);
            gap: 8px;
        }

        .controls {
            all: unset;
            margin: auto;
            margin: auto;
            font-size: 32px;
            border-radius: 16px;
            filter: drop-shadow(2px 2px 8px black);

            &:hover {
                background-color: #ffffff80;
            }

            &:active {
                filter: drop-shadow(0 0 4px black);
            }
        }
    }
</style>