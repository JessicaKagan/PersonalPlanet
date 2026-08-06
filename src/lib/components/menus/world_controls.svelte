<script lang="ts">
    import RootMenu from "../root_menu.svelte";
    import { CustomPhaserEvents, GraphicsOverlays, TileInformationDialogMode, WorldControlsTools } from "../../../game/defines/core_defines";

    import type { TPhaserRef } from "../../../PhaserGame.svelte";
    import type { Game } from "../../../game/scenes/Game";
    import { EventBus } from "../../../game/EventBus";

    interface WorldControlProps {
        class?: string,
        phaserRef: TPhaserRef
    }

    let {
        class: propsClass = "",
        phaserRef: phaserRef = { game: null, scene: null }
    }: WorldControlProps = $props()

    let currentWorldControlTool: WorldControlsTools | undefined = $state();
    let currentOverlay: GraphicsOverlays | undefined = $state(GraphicsOverlays.None);

    EventBus.on(CustomPhaserEvents.CurrentWorldControlToolSelected, (tool: WorldControlsTools) => {
        currentWorldControlTool = tool;
    });

    const selectTool = (tool: WorldControlsTools): void => {
        // FUTURE: This "typecast to the relevant scene type" pattern was taken from the Phaser Svelte template.
        // Is this a clean and safe way to get the information we need passed in? If not, we'll want to update it at some point.
        const scene = phaserRef.scene as Game;

        if (scene) {
            // Updating our local reference as well as the game scene reference helps us keep track of state in a Svelte-native way.
            scene.currentWorldControlTool = tool;
            currentWorldControlTool = tool;
        }
    }

    const selectOverlay = (overlay: GraphicsOverlays): void => {
        const scene = phaserRef.scene as Game;

        if (scene) {
            scene.currentOverlay = overlay;
            currentOverlay = overlay;
        }
    }

    const isToolSelected = (tool: WorldControlsTools): boolean=> {
        return currentWorldControlTool === tool;
    }

    const isOverlaySelected = (overlay: GraphicsOverlays): boolean=> {
        return currentOverlay === overlay;
    }

</script>

<RootMenu class={propsClass}>
    <!-- FUTURE: We should consider sourcing different icons here, since emojis vary from platform to platform.
        These could either be images or SVGs. Potentially even a combination of the two. Material Symbols works well for the latter. -->
    <button
        class="controls {isToolSelected(WorldControlsTools.Query) ? 'selected' : ''}"
        title="Query"
        aria-label="query"
        onclick={() => selectTool(WorldControlsTools.Query)}>
        🔍
    </button>
    <button
        class="controls {isToolSelected(WorldControlsTools.Draw) ? 'selected' : ''}"
        title="Draw"
        aria-label="draw"
        onclick={() => selectTool(WorldControlsTools.Draw)}>
        🖌️
    </button>

    <!-- Overlay controls -->
    <button
        class="controls {isOverlaySelected(GraphicsOverlays.None) ? 'selected' : ''}"
        title="Disable All Overlays"
        aria-label="disable all overlays"
        onclick={() => selectOverlay(GraphicsOverlays.None)}>
        🪟
    </button>
    <button
        class="controls {isOverlaySelected(GraphicsOverlays.Lifeforms) ? 'selected' : ''}"
        title="Show Life"
        aria-label="show life"
        onclick={() => selectOverlay(GraphicsOverlays.Lifeforms)}>
        🧬
    </button>
</RootMenu>

<style lang="scss">
    :global {
        .menu-container {
            // FUTURE: We may want to revisit the height of this toolbar when we have more tools and overlays.
            height: -webkit-fill-available;
            margin: 64px auto;
            overflow-y: scroll;
            position: absolute;

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

            &.selected {
                background-color: #ffffffc0;
            }
        }
    }
</style>