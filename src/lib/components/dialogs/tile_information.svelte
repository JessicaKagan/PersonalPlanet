<script lang="ts">
    import RootDialog from "../root_dialog.svelte";

    import type { TPhaserRef } from "../../../PhaserGame.svelte";
    import type { Game } from "../../../game/scenes/Game";
    import { CustomPhaserEvents, TileInformationDialogMode } from "../../../game/defines";
    import { EventBus } from "../../../game/EventBus";

    interface TileInformationProps {
        class?: string,
        phaserRef: TPhaserRef
    }

    // TODO: Figure out how best to handle passing in a dialog mode.
    // Classes could theoretically work, but mixing prebaked classes and custom classes needs figuring out.
    let dialogMode = TileInformationDialogMode.HOVER;
    let customCSSStyles = $state(''); // Used for positioning.

    let {
        class: propsClass = "",
        phaserRef: phaserRef = { game: null, scene: null }
    }: TileInformationProps = $props()

    EventBus.on(CustomPhaserEvents.CursorPositionInViewPort, (position: Phaser.Math.Vector2) => {
        if (dialogMode === TileInformationDialogMode.HOVER) {
            // FUTURE: Make the clamping logic here stricter, and consider moving it to a utility function.
            const x = position.x > window.innerWidth ? window.innerWidth : position.x < 0 ? 0 : position.x;
            const y = position.y > window.innerHeight ? window.innerHeight : position.y < 0 ? 0 : position.y;
            customCSSStyles = `position: fixed; left:${x}px; top:${y}px;`;
        }
    });

</script>

<RootDialog id="tile-information-dialog" style={customCSSStyles}>
    <p>Hello tile information dialog world</p>
</RootDialog>

<style lang="scss">
    :global {
        #tile-information-dialog {
            width: 128px;
            height: 128px;
            margin: unset; // As part of PP-3-2, this ensures that the modal follows the user's cursor in hover mode.

            &::backdrop {
                pointer-events: none;
                background: none;
            }
        }
    }
</style>