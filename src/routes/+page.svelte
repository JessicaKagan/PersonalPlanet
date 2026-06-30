<script lang="ts">

    import type { Scene } from "phaser";
    import type { MainMenu } from "../game/scenes/MainMenu";
    import PhaserGame, { type TPhaserRef } from "../PhaserGame.svelte";

    import WorldControls from "../lib/components/menus/world_controls.svelte";
    import TileInformation from "../lib/components/dialogs/tile_information.svelte";
    import { CustomPhaserEvents, WorldControlsTools } from "../game/defines";
    import { EventBus } from "../game/EventBus";

    // The sprite can only be moved in the MainMenu Scene
    let canMoveSprite = $state(false);
    let currentWorldControlTool: WorldControlsTools = $state(WorldControlsTools.None);

    //  References to the PhaserGame component (game and scene are exposed)
    let phaserRef: TPhaserRef = $state({ game: null, scene: null});
    const spritePosition = { x: 0, y: 0 };

    EventBus.on(CustomPhaserEvents.CurrentWorldControlToolSelected, (tool: WorldControlsTools) => {
        currentWorldControlTool = tool;
    });

    const canShowTileInformationDialog: boolean = $derived.by(() => {
        // TODO: This dialog is eligible to be displayed in the following two cases:
        // 1. The query tool is selected.
        // 2. (Not implemented yet) The user has clicked on a tile with the query tool active and hasn't dismissed the detailed version dialog after doing so.
        return currentWorldControlTool == WorldControlsTools.Query;
    });

    const changeScene = () => {

        const scene = phaserRef.scene as MainMenu;

        if (scene)
        {

            // Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
            scene.changeScene();

        }

    }
    
    const moveSprite = () => {

        const scene = phaserRef.scene as MainMenu;

        if (scene)
        {

            // Get the update logo position
            (scene as MainMenu).moveLogo(({ x, y }) => {

                spritePosition.x = x;
                spritePosition.y = y;

            });

        }

    }

    const addSprite = () => {

        const scene = phaserRef.scene as Scene;

        if (scene)
        {

            // Add more stars
            const x = Phaser.Math.Between(64, scene.scale.width - 64);
            const y = Phaser.Math.Between(64, scene.scale.height - 64);

            //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
            const star = scene.add.sprite(x, y, 'star');

            //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
            //  You could, of course, do this from within the Phaser Scene code, but this is just an example
            //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
            scene.add.tween({
                targets: star,
                duration: 500 + Math.random() * 1000,
                alpha: 0,
                yoyo: true,
                repeat: -1
            });
            
        }

    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Scene) => {

        canMoveSprite = (scene.scene.key !== "MainMenu");

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

            {#if canShowTileInformationDialog == true}
                <TileInformation phaserRef={phaserRef}></TileInformation>
            {/if}
        {/if}
    </div>

    <!-- FUTURE: These debugging controls from the template will be eventually be removed. -->
    <div>
        <div>
            <button class="button" on:click={changeScene}>Change Scene</button>
        </div>
        <div>
            <button class="button" disabled={canMoveSprite} on:click={moveSprite}>Toggle Movement</button>
        </div>
        <div class="spritePosition">
            Sprite Position:
            <pre>{JSON.stringify(spritePosition, null, 2)}</pre>
        </div>
        <div>
            <button class="button" on:click={addSprite}>Add New Sprite</button>
        </div>
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
    
    .spritePosition {
        margin: 10px 0 0 10px;
        font-size: 0.8em;
    }

    .button {
        width: 140px;
        margin: 10px;
        padding: 10px;
        background-color: #000000;
        color: rgba(255, 255, 255, 0.87);
        border: 1px solid rgba(255, 255, 255, 0.87);
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            border: 1px solid #0ec3c9;
            color: #0ec3c9;
        }

        &:active {
            background-color: #0ec3c9;
        }

        /* Disabled styles */
        &:disabled {
            cursor: not-allowed;
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: rgba(255, 255, 255, 0.3);
        }
    }
</style>
