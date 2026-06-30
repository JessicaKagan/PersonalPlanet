<script lang="ts">
    import RootDialog from "../root_dialog.svelte";

    import type { TPhaserRef } from "../../../PhaserGame.svelte";
    import type { Game } from "../../../game/scenes/Game";
    import { CustomPhaserEvents, TileInformationDialogMode, type QueryInfo } from "../../../game/defines";
    import { EventBus } from "../../../game/EventBus";

    interface TileInformationProps {
        class?: string,
        phaserRef: TPhaserRef
    }

    // TODO: Figure out how best to handle passing in a dialog mode.
    // Classes could theoretically work, but mixing prebaked classes and custom classes needs figuring out.
    let dialogMode = TileInformationDialogMode.HOVER;
    let customCSSStyles = $state(''); // Used for positioning.

    let currentQueryInfo: QueryInfo | undefined = $state();

    let {
        class: propsClass = "",
        phaserRef: phaserRef = { game: null, scene: null }
    }: TileInformationProps = $props()

    EventBus.on(CustomPhaserEvents.CursorPositionInViewPort, (position: Phaser.Math.Vector2) => {
        const scene = phaserRef.scene as Game;

        if (!scene) {
            return;
        }

        if (dialogMode === TileInformationDialogMode.HOVER) {
            // FUTURE: Make the clamping logic here stricter, and consider moving it to a utility function.
            const x = position.x > window.innerWidth ? window.innerWidth : position.x < 0 ? 0 : position.x;
            const y = position.y > window.innerHeight ? window.innerHeight : position.y < 0 ? 0 : position.y;
            customCSSStyles = `position: fixed; left:${x}px; top:${y}px;`;

            currentQueryInfo = scene.currentQueryInfo;
        }
    });

</script>

<RootDialog id="tile-information-dialog" style={customCSSStyles}>
    {#if currentQueryInfo?.tile}
        <section class="tile-information-dialog_section">
            <h3>Tile Details</h3>
            <h4>{currentQueryInfo.tile.terrainType}</h4>
            <span>({currentQueryInfo.tile.x}, {currentQueryInfo.tile.y})</span>
        </section>
    {/if}
</RootDialog>

<style lang="scss">
    :global {
        #tile-information-dialog {
            width: 128px;
            height: 160px;
            margin: unset; // As part of PP-3-2, this ensures that the modal follows the user's cursor in hover mode.
            padding: 0;

            &::backdrop {
                pointer-events: none;
                background: none;
            }

            &_section {
                margin: 8px;
            }
        }
    }
</style>