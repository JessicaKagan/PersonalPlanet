<script lang="ts">
    import RootMenu from "../root_menu.svelte";
    import { WorldControlsTools } from "../../../game/defines";

    import type { TPhaserRef } from "../../../PhaserGame.svelte";
    import type { Game } from "../../../game/scenes/Game";

    interface WorldControlProps {
        class?: string,
        phaserRef: TPhaserRef
    }

    let {
        class: propsClass = "",
        phaserRef: phaserRef = { game: null, scene: null }
    }: WorldControlProps = $props()

    const selectTool = (tool: WorldControlsTools): void => {
        // FUTURE: This "typecast to the relevant scene type" pattern was taken from the Phaser Svelte template.
        // Is this a clean and safe way to get the information we need passed in? If not, we'll want to update it at some point.
        const scene = phaserRef.scene as Game;

        if (scene) {
            scene.currentWorldControlTool = tool;
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