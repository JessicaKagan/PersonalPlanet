<script lang="ts">
    import RootDialog from "../root_dialog.svelte";

    import type { TPhaserRef } from "../../../PhaserGame.svelte";
    import type { Game } from "../../../game/scenes/Game";
    import { CustomPhaserEvents, TileInformationDialogMode, WATER_FREEZING_TEMPERATURE, WorldControlsTools, type QueryInfo } from "../../../game/defines";
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


    // Whenever the simulation updates while the tile information dialog is open,
    // we should update the data in the query info. This is most relevant for the detailed view.
    EventBus.on(CustomPhaserEvents.SimulationUpdated, () => {
        const scene = phaserRef.scene as Game;

        if (!scene) {
            return;
        }

        currentQueryInfo = scene.currentQueryInfo;
    });

    EventBus.on(CustomPhaserEvents.TileSelected, (queryInfo: QueryInfo) => {
        dialogMode = TileInformationDialogMode.DETAILED;
        currentQueryInfo = queryInfo;

        customCSSStyles = ''; // FUTURE: If we have more ways of switching to detailed mode, we may want to move this cleanup step.
    });

    const closeDialog = (): void => {
        // Clean up unneeded information before closing the dialog.
        currentQueryInfo = undefined;

        const tileInformationDialog = document.querySelector('#tile-information-dialog') as HTMLDialogElement;
        tileInformationDialog?.close();
    }

    const getTileHeight = (): string => {
        const scene = phaserRef.scene as Game;

        if (!scene || !scene.world || currentQueryInfo?.tile?.elevation == undefined) {
            return '';
        }

        return `${(currentQueryInfo?.tile?.elevation - scene.world.seaLevel).toFixed(2)}`;
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
            <p>({currentQueryInfo.tile.x}, {currentQueryInfo.tile.y})</p>
            <!-- It's more verbose to have separate templates for each dialog mode,
                but it's much easier to tell what should and shouldn't be in each mode this way. -->
            {#if dialogMode === TileInformationDialogMode.HOVER}
                <p>Temperature: {(currentQueryInfo.tile.temperature - WATER_FREEZING_TEMPERATURE).toFixed(2)}°C</p>
                <p>Elevation: {getTileHeight()} meters</p>
            {/if}

            {#if dialogMode === TileInformationDialogMode.DETAILED}
                <p>Temperature: {(currentQueryInfo.tile.temperature - WATER_FREEZING_TEMPERATURE).toFixed(2)}°C</p>
                <p>Albedo: {currentQueryInfo.tile.albedo}%</p>
                <p>Humidity: {currentQueryInfo.tile.humidity}%</p>
                <p>Elevation: {getTileHeight()} meters</p>
            {/if}
        </section>
    {/if}
</RootDialog>

<style lang="scss">
    :global {
        #tile-information-dialog {
            width: 128px;
            height: 270px;
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

                p {
                    margin: 8px 0;
                }
            }

            &.hover {
                position: fixed;
            }

            &.detailed {
                width: 256px;
                height: 80%;
                overflow-y: scroll;
                position: absolute;
                top: 64px;
                left: 80%;

                // Animate the switch from hovering tooltip to detailed window.
                transition: width height left top;
                transition-duration: 0.25s;
                transition-timing-function: ease-in-out;
            }
        }
    }
</style>