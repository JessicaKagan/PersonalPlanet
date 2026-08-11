import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { World, DEFAULT_WORLD_SIZE } from '../world/World';
import { type Tile } from '../world/Tile';
import { 
    DEFAULT_SIMULATION_TICKS_PER_SECOND,
    DEFAULT_ZOOM_TICK,
    DEFAULT_TILE_SIZE,
    MINIMUM_ZOOM_FACTOR,
    MAXIMUM_ZOOM_FACTOR,
    WorldControlsTools,
    CustomPhaserEvents,
    GraphicsOverlays,
    type QueryInfo,
    DEFAULT_SIMULATION_TICKS_PER_CLIMATE_UPDATE,
    DEFAULT_SIMULATION_TICKS_PER_LIFE_UPDATE
} from '../defines/core_defines';

import * as RenderingService from '../services/rendering';

export class Game extends Scene
{
    // The camera and world are initialized in this scene's create() hook (as provided by Phaser),
    // as opposed to the scene constructor.
    camera!: Phaser.Cameras.Scene2D.Camera;
    world!: World;

    /** The representation of each World tile in the renderer. */
    tileSpriteMap: Phaser.GameObjects.TileSprite[] = [];

    /** The representation of each Phaser game object required for the user's overlay in the renderer. */
    overlayMap: RenderingService.OverlayMap = {
        images: [],
        sprites: [],
        tileSprites: []
    };

    /** The representation of each of the world's Characters in the renderer. */
    characters: Phaser.GameObjects.Sprite[] = [];

    public updateInterval = 1000 / DEFAULT_SIMULATION_TICKS_PER_SECOND; // Update the simulation every 20ms by default.

    // Keep track of times and deltas for Phaser scene and simulation updates.
    public timeOfLastSceneUpdate = 0;
    public timeSinceLastSceneUpdate = 0;
    public timeOfLastSimulationUpdate = 0;
    public simulationTicksElapsed = 0;

    // FUTURE: Use this to track and potentially stop the update loop (for instance, after pausing is implemented).
    private updateSimulationTimeoutHandler: number | undefined;
    
    // FUTURE: Phaser.Input.Pointer contains a "buttons" property which can be used to determine which buttons a user is holding.
    // We may want to use helper variables to make the code more readable, but either way, these should be revisited as we build out global event handlers.
    public isPointerHeldDown = false;
    public isMiddleMouseHeldDown = false;

    private _currentWorldControlTool = WorldControlsTools.None;
    public get currentWorldControlTool(): WorldControlsTools {
        return this._currentWorldControlTool;
    }

    /**
     * @warning As a general rule, when the user changes their tool (or a function changes it programatically),
     * components should interact with that by consuming the CurrentWorldControlToolSelected event, instead of directly following up.
     * This helps keep functions simple and helps separate concerns.
     */
    public set currentWorldControlTool(tool: WorldControlsTools) {
        this._currentWorldControlTool = tool;
        EventBus.emit(CustomPhaserEvents.CurrentWorldControlToolSelected, this.currentWorldControlTool);
    }

    private _currentOverlay = GraphicsOverlays.None;
    public get currentOverlay(): GraphicsOverlays {
        return this._currentOverlay;
    }

    /**
     * @warning As a general rule, when the user changes their overlay (or a function changes it programatically),
     * components should interact with that by consuming the OverlaySelected event, instead of directly following up.
     * This helps keep functions simple and helps separate concerns.
     */
    public set currentOverlay(overlay: GraphicsOverlays) {
        this._currentOverlay = overlay;
        EventBus.emit(CustomPhaserEvents.OverlaySelected, this._currentOverlay);

        RenderingService.updateOverlayMap(this.overlayMap, overlay, this.world, this.scene.scene);
    }


    public currentQueryInfo: QueryInfo = {};

    constructor ()
    {
        super('Game');

        // Vite hotloads are helpful for UX work, but can mess with the simulation loop.
        // We should clear any existing updateSimulation instances in this case.
        // FUTURE: We should update the scene to keep track of us running in devmode, and only add this logic as appropriate.
        const hotContext = (import.meta as any).hot;
        if (hotContext) {
            hotContext.on("vite:beforeUpdate", () => {
                if (this.updateSimulationTimeoutHandler !== undefined) {
                    clearTimeout(this.updateSimulationTimeoutHandler);
                }
            });
        }
    }


    create(): void {
        // First, generate, then draw the player's World.
        // FUTURE: We should eventually allow users to generate a world with a custom size.
        this.world = new World(DEFAULT_WORLD_SIZE.x, DEFAULT_WORLD_SIZE.y);
        this.world.populateWorld();
        this.renderInitialWorld();
        this.characters = RenderingService.updateCharacterSprites(this.characters, this.world.characters, this.scene.scene);

        // Then, set up the Game scene's controls.
        this.addCamera();
        this.addControls();

        // Finally, begin running the simulation, and tell other components the current scene is ready.
        this.updateSimulationTimeoutHandler = this.updateSimulation();
        EventBus.emit('current-scene-ready', this);
    }

    addCamera(): void {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.zoom = 1/8; // Start zoomed out, for a better view of the world.
        
        // Allowing the camera to scroll slightly past the world bounds makes tiles easier to interact with and ensures that users can view the entire world.
        // FUTURE: I'd like to eventually make the world wrap horizontally, so we'll need to revisit this at some point.
        this.camera.setBounds(
            -8 * DEFAULT_TILE_SIZE,
            -8 * DEFAULT_TILE_SIZE,
            (this.world.width + 8) * DEFAULT_TILE_SIZE,
            (this.world.height + 8) * DEFAULT_TILE_SIZE
        );
    }

    addControls(): void {
        this.input.addListener('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            this.isPointerHeldDown = true;

            if (pointer.button == 1) {
                this.isMiddleMouseHeldDown = true;
            }
        });

        this.input.addListener('pointerup', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            this.isPointerHeldDown = false; 
            this.isMiddleMouseHeldDown = false;

            if (this.currentWorldControlTool === WorldControlsTools.Query) {
                // TileInformation will switch to the detailed view, which will stay open until dismissed or the user reselects the query tool.
                EventBus.emit(CustomPhaserEvents.TileSelected, this.currentQueryInfo);
                this.currentWorldControlTool = WorldControlsTools.None;
            }
        });

        this.input.addListener('pointermove', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            // Drag the camera based on the user's mouse movement.
            if (this.isMiddleMouseHeldDown) {
                const delta = {
                    x: (pointer.position.x - pointer.prevPosition.x) / this.camera.zoom,
                    y: (pointer.position.y - pointer.prevPosition.y) / this.camera.zoom
                };

                // The camera bounds we set ensure that users can't scroll outside their worlds.
                this.camera.setScroll(this.camera.scrollX - delta.x, this.camera.scrollY - delta.y);
            } else {
                switch (this.currentWorldControlTool) {
                    case WorldControlsTools.Query:
                        // When the query tool is selected, we can assume the tile information dialog is open in hover mode.
                        // We should send over the mouse coordinates, which will be used to adjust the dialog's position.
                        EventBus.emit(CustomPhaserEvents.CursorPositionInViewPort, pointer.position);

                        const currentTileSprite = currentlyOver.find(gameObject => gameObject.type === 'TileSprite');

                        if (!currentTileSprite) {
                            return;
                        }

                        const currentWorldTile = this.world.getTile(currentTileSprite.data.values['worldX'], currentTileSprite.data.values['worldY'])
                        this.setQueryInfo(currentWorldTile);
                        break;
                    default:
                        break;
                }
            }
        });

        this.input.addListener('wheel', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            // Adjust the zoom every time the mousewheel ticks.
            // FUTURE: We should center the camera if users zoom out enough that their entire world is visible.
            // FUTURE: We should zoom towards the user's cursor if doing so makes sense.
            // I think this entails setting a scroll position based on averaging the position of the tile they're hovering over and the tile that's closest
            // to the center of the screen.
            if (pointer.deltaY >= 0) {
                this.camera.zoom /= DEFAULT_ZOOM_TICK; // Zoom out when scrolling "down"
            } else {
                this.camera.zoom *= DEFAULT_ZOOM_TICK; // Zoom in when scrolling "up".
            }

            if (this.camera.zoom > MINIMUM_ZOOM_FACTOR) {
                this.camera.zoom = MINIMUM_ZOOM_FACTOR;
            }

            if (this.camera.zoom < MAXIMUM_ZOOM_FACTOR) {
                this.camera.zoom = MAXIMUM_ZOOM_FACTOR;
            }
        });
    }

    /** Bundle up information about what the user is querying into an easily readable format for other components to view.
     * FUTURE: This is currently called during mouse movement events when the query tool is selected.
     * As part of PP-3-2, we'll start calling it in updateSimulation() when the user has clicked a tile to monitor.
     * We'll probably want to keep track of a "currently selected tile" for this, and potentially other features.
     */
    setQueryInfo(tile?: Tile): void {
        if (!tile) {
            return;
        }

        this.currentQueryInfo = {
            tile
        }
    }

    /** Create our initial graphical representation of the user's World.
     * FUTURE: Phaser's "game object factory" appears to be tightly coupled to scenes. I want to move this method to the RenderingService,
     * but we'd need to figure out a way to account for this coupling first. For now, this has to live here.
     */
    renderInitialWorld(): void {
        // Clear existing tiles
        this.tileSpriteMap.forEach(tile => tile.destroy());
        this.tileSpriteMap = [];

        const tileSize = 64; // Each tile is 64x64 pixels
        
        for (let x = 0; x < this.world.width; x++) {
            for (let y = 0; y < this.world.height; y++) {
                const tile = this.world.getTile(x, y);
                if (tile) {
                    // Create a visual representation of the tile
                    const tileSprite = this.add.tileSprite(
                        x * tileSize,
                        y * tileSize,
                        tileSize,
                        tileSize,
                        RenderingService.getTileTextureKey(tile.terrainType)
                    );
                    
                    // Set the sprite to be at the correct position in world space.
                    tileSprite.setPosition(x * tileSize, y * tileSize);
                    tileSprite.setScale(1);
                    
                    // Users should be able to click on tiles to interact with them.
                    tileSprite.setInteractive(); 
                    
                    // Including tracking data from the tile proper allows us to interact with the world more easily.
                    tileSprite.setData({tileID: tile.id, worldX: tile.x, worldY: tile.y})
                    
                    // Store reference for potential updates
                    this.tileSpriteMap.push(tileSprite);
                }
            }
        }
    }
    
    /** An event handler for the Game Scene's update event in Phaser.
     * Game logic that needs to happen per frame (as opposed to per simulation tick) should live here. */
    update (time: number, delta: number): void {
        // For now, just make a note of when this event last fired.
        // FUTURE: This would be helpful for implementing an FPS counter at some point!
        this.timeOfLastSceneUpdate = time;
        this.timeSinceLastSceneUpdate = delta;
    }

    // TODO: Figure out if this and updateTileVisual should be moved to an "Update" file. Perhaps its own folder, too?
    /** Run simulation update tasks at preset intervals.
     * @returns A numeric ID for tracking the recursive timeout loop used to run simulation ticks.
     */
    private updateSimulation(): number {
        // We use a recursive timeout for to make sure every simulation tick is complete before moving onto the next, in case of slowdown.
        // setInterval allows us to set a maximum speed, but doesn't properly account for this.
        return setTimeout(() => {
            this.timeOfLastSimulationUpdate = Date.now();
            this.simulationTicksElapsed += 1;

            if (this.simulationTicksElapsed % DEFAULT_SIMULATION_TICKS_PER_CLIMATE_UPDATE === 0) {
                this.world.updateClimate();
                this.world.updateAllTiles(tile => this.world.updateTileTerrain(tile));
                this.world.updateAllTiles(tile => this.world.updateTileAlbedo(tile));
            }

            if (this.simulationTicksElapsed % DEFAULT_SIMULATION_TICKS_PER_LIFE_UPDATE === 0) {
                if (this.currentOverlay === GraphicsOverlays.Lifeforms) {
                    RenderingService.updateOverlayMap(this.overlayMap, GraphicsOverlays.Lifeforms, this.world, this.scene.scene);
                }
            }

            // FUTURE: This could be computationally expensive.
            // Is there a way that we can start tracking which tiles in a world need a visual update and only updating those?
            for (const tileSprite of this.tileSpriteMap) {
                RenderingService.updateTileVisual(this.world, tileSprite);
            }
            
            // Update our information about the currently queried tile for the TileInformation component.
            if (this.currentQueryInfo.tile) {
                const updatedTile = this.world.getTile(this.currentQueryInfo.tile.x, this.currentQueryInfo.tile.y);
                this.setQueryInfo(updatedTile);
                EventBus.emit(CustomPhaserEvents.SimulationUpdated);
            }

            this.updateSimulationTimeoutHandler = this.updateSimulation();
        }, this.updateInterval);
    }

    changeScene (): void {
        this.scene.start('MainMenu');
    }
}
