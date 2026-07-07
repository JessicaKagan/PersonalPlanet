<script lang="ts">
    import RootDialog from "../root_dialog.svelte";

    import type { TPhaserRef } from "../../../PhaserGame.svelte";
    import type { Game } from "../../../game/scenes/Game";
    import { CustomPhaserEvents, TileInformationDialogMode, WorldControlsTools, type QueryInfo } from "../../../game/defines";
    import { EventBus } from "../../../game/EventBus";

    interface TileInformationProps {
        class?: string,
        phaserRef: TPhaserRef
    }

    let dialogMode = $state(TileInformationDialogMode.HOVER);
    let customCSSStyles = $state(''); // Used for positioning.

    let currentQueryInfo: QueryInfo | undefined = $state();

    let {
        class: propsClass = "",
        phaserRef: phaserRef = { game: null, scene: null }
    }: TileInformationProps = $props()

    EventBus.on(CustomPhaserEvents.CurrentWorldControlToolSelected, (tool: WorldControlsTools) => {
        if (tool == WorldControlsTools.Query) {
            dialogMode = TileInformationDialogMode.HOVER;
        }
    });

    EventBus.on(CustomPhaserEvents.CursorPositionInViewPort, (position: Phaser.Math.Vector2) => {
        const scene = phaserRef.scene as Game;

        if (!scene) {
            return;
        }

        if (dialogMode === TileInformationDialogMode.HOVER) {
            // FUTURE: Make the clamping logic here stricter, and consider moving it to a utility function.
            const x = position.x > window.innerWidth ? window.innerWidth : position.x < 0 ? 0 : position.x;
            const y = position.y > window.innerHeight ? window.innerHeight : position.y < 0 ? 0 : position.y;
            customCSSStyles = `left:${x}px; top:${y}px;`;

            currentQueryInfo = scene.currentQueryInfo;
        }
    });

    EventBus.on(CustomPhaserEvents.TileSelected, (queryInfo: QueryInfo) => {
        dialogMode = TileInformationDialogMode.DETAILED;
        currentQueryInfo = queryInfo;

        customCSSStyles = ''; // FUTURE: If we have more ways of switching to detailed mode, we may want to move this cleanup step.
    });

    const closeDialog = () => {
        // Clean up unneeded information before closing the dialog.
        currentQueryInfo = undefined;

        const tileInformationDialog = document.querySelector('#tile-information-dialog') as HTMLDialogElement;
        tileInformationDialog?.close();
    }
</script>

<RootDialog
    id="tile-information-dialog"
    style={customCSSStyles}
    class={dialogMode === TileInformationDialogMode.HOVER ? 'hover' : 'detailed'}>
    {#if dialogMode === TileInformationDialogMode.DETAILED}
        <section id="tile-information-dialog_detailed-controls">
            <button id="tile-information-dialog_detailed-controls_close" onclick={() => closeDialog()}>❎</button>
        </section>
    {/if}
    {#if currentQueryInfo?.tile}
        <section class="dialog-section">
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

            &_detailed-controls {
                display: flex;
                flex-direction: row-reverse;

                &_close {
                    font-size: 32px;
                    // FUTURE: We should turn off more default browser button styles by default.
                    background-color: unset;
                    border: none;

                    // FUTURE: These styles are also in the world controls and should be moved into a dialog/menu button theme.
                    filter: drop-shadow(2px 2px 8px black);

                    &:hover {
                        background-color: #ffffff80;
                    }

                    &:active {
                        filter: drop-shadow(0 0 4px black);
                    }
                }
            }


            // Repeated sections, in case we need an arbitrary number of them. Not to be confused with a bespoke section like the detailed controls.
            .dialog-section {
                margin: 8px;
            }

            &.detailed {
                height: 320px; // DEBUG
            }
        }
    }
</style>