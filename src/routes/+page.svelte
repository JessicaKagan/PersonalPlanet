<script lang="ts">

    import type { Scene } from "phaser";
    import { Math as PhaserMath } from "phaser";
    import type { MainMenu } from "../game/scenes/MainMenu";
    import PhaserGame, { type TPhaserRef } from "../PhaserGame.svelte";

    import WorldControls from "../lib/components/menus/world_controls.svelte";
    import TileInformation from "../lib/components/dialogs/tile_information.svelte";
    import { CustomPhaserEvents, WorldControlsTools } from "../game/defines/core_defines";
    import { EventBus } from "../game/EventBus";
    import type { Game } from "../game/scenes/Game";

    // The sprite can only be moved in the MainMenu Scene
    let currentWorldControlTool: WorldControlsTools = $state(WorldControlsTools.None);

    //  References to the PhaserGame component (game and scene are exposed)
    let phaserRef: TPhaserRef = $state({ game: null, scene: null});

    EventBus.on(CustomPhaserEvents.CurrentWorldControlToolSelected, (tool: WorldControlsTools) => {
        currentWorldControlTool = tool;
        const tileInformationDialog = document.querySelector('#tile-information-dialog') as HTMLDialogElement;


        if (currentWorldControlTool == WorldControlsTools.Query) {
            tileInformationDialog?.show();
        } else {
            // We should close the dialog either if the user explicitly selected another tool,
            // or if they end up with no tool selected AND no queryable tile.
            const scene = phaserRef.scene as Game;
            const hasQueryableTile = scene?.currentQueryInfo.tile !== undefined;

            if (currentWorldControlTool !== WorldControlsTools.None && !hasQueryableTile) {
                tileInformationDialog?.close();
            }
        }
    });

    // FUTURE: Depending on how the UX for Personal Planet shapes out, we might want a method for changing the scene
    // from Svelte. This will stay around (dummied) out for reference until then.
    // const changeScene = () => {
    //     const scene = phaserRef.scene as MainMenu;

    //     if (scene)
    //     {
    //         // Call the changeScene method defined in the `MainMenu` and `Game` Scenes
    //         scene.changeScene();
    //     }
    // }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Scene) => {

    }
    
    const isInGame = (): boolean => {
        return phaserRef.scene?.scene.key === "Game";
    }
</script>

<div id="app">
    <PhaserGame bind:phaserRef={phaserRef} currentActiveScene={currentScene} />
    
    <!-- The parent div for all UX components rendered on top of the game. 
        Any component that needs to interact with the gamestate will need a phaserRef passed in. -->
    <div id="app-ui">
        {#if isInGame() == true}
            <WorldControls phaserRef={phaserRef}></WorldControls>

            <TileInformation phaserRef={phaserRef} class='tile-information-menu'></TileInformation>
        {/if}
    </div>
</div>

<style lang="scss">
    #app {
        width: 100%;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        &-ui {
            width: 100%;
            height: 100%;
            position: absolute;

            // Pointer events should pass through to the UI container's children, or the Phaser game instance if there's nothing present.
            pointer-events: none;
        }
    }
</style>
