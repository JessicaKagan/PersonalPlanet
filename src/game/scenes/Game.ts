import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { TerrainType } from '../world/TerrainType';
import { World, DEFAULT_WORLD_SIZE } from '../world/World';
import { DEFAULT_TILE_SIZE } from '../world/Tile';
import { DEFAULT_SIMULATION_TICKS_PER_SECOND, DEFAULT_ZOOM_TICK, MINIMUM_ZOOM_FACTOR, MAXIMUM_ZOOM_FACTOR, WorldControlsTools } from '../defines';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    world: World;
    tileMap: Phaser.GameObjects.TileSprite[] = [];

    public updateInterval = 1000 / DEFAULT_SIMULATION_TICKS_PER_SECOND; // Update the simulation every 100ms by default.
    public timeSinceLastUpdate = 0; // Keep track of how much time has passed since the last interval.
    
    // FUTURE: Phaser.Input.Pointer contains a "buttons" property which can be used to determine which buttons a user is holding.
    // We may want to use helper variables to make the code more readable, but either way, these should be revisited as we build out global event handlers.
    public isPointerHeldDown = false;
    public isMiddleMouseHeldDown = false;

    constructor ()
    {
        super('Game');
    }

    create (): void {
        // FUTURE: We should eventually allow users to generate a world with a custom size.
        this.world = new World(DEFAULT_WORLD_SIZE.x, DEFAULT_WORLD_SIZE.y);
        
        // Fill the world with some test tiles
        this.world.populateWorld();
        
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.setBounds(0, 0, DEFAULT_WORLD_SIZE.x * DEFAULT_TILE_SIZE, DEFAULT_WORLD_SIZE.y * DEFAULT_TILE_SIZE);

        // Render the initial state of the world
        this.renderInitialWorld();

        this.addControls();

        EventBus.emit('current-scene-ready', this);
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

    renderInitialWorld(): void {
        // Clear existing tiles
        this.tileMap.forEach(tile => tile.destroy());
        this.tileMap = [];
        
        // Render each tile in the world
        const tiles = this.world.getTiles();
        const tileSize = 64; // Each tile is 64x64 pixels
        
        for (let x = 0; x < this.world.getWidth(); x++) {
            for (let y = 0; y < this.world.getHeight(); y++) {
                const tile = tiles[x][y];
                if (tile) {
                    // Create a visual representation of the tile
                    const tileSprite = this.add.tileSprite(
                        x * tileSize,
                        y * tileSize,
                        tileSize,
                        tileSize,
                        this.world.getTileTextureKey(tile.terrainType)
                    );
                    
                    tileSprite.setPosition(x * tileSize, y * tileSize); // Set the sprite to be at the correct position in world space
                    tileSprite.setScale(1);
                    tileSprite.setInteractive(); // Users should be able to click on tiles to interact with them.
                    
                    // Store reference for potential updates
                    this.tileMap.push(tileSprite);
                }
            }
        }
    }
    
    update (time: number, delta: number): void {
        // Every time Phaser produces a new frame, check if the simulation needs an update.
        // FUTURE: We most likely want this to work the other way around - i.e, the simulation itself should update consistently (as possible),
        // and the renderer should pick up any changes to the in-game world that have happened since the last frame.
        this.timeSinceLastUpdate += delta;
        if (this.timeSinceLastUpdate >= this.updateInterval) {
            this.updateSimulation();

            this.timeSinceLastUpdate = 0;
        }
    }

    // TODO: Figure out if this and updateTileVisual should be moved to an "Update" file. Perhaps its own folder, too?
    updateSimulation()
    {
        // This is where we would update simulation layers at different frequencies
        // For now, let's just do a simple debug update to test that components work together
        
        // Update some tiles randomly for testing
        if (Math.random() > 0.7) { // 30% chance to change a tile each tick
            const x = Math.floor(Math.random() * this.world.getWidth());
            const y = Math.floor(Math.random() * this.world.getHeight());
            
            const tile = this.world.getTile(x, y);
            if (tile && tile.terrainType !== TerrainType.EMPTY) {
                // Change to a different terrain type for testing
                const terrainTypes = [
                    TerrainType.OCEAN,
                    TerrainType.FRESHWATER,
                    TerrainType.GRASSLAND,
                    TerrainType.TUNDRA,
                    TerrainType.TAIGA,
                    TerrainType.HOT_DESERT
                ];
                tile.terrainType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
                
                // Update the visual representation
                this.updateTileVisual(x, y);
            }
        }
    }

    updateTileVisual(x: number, y: number)
    {
        // Find and update the corresponding sprite
        const tile = this.world.getTile(x, y);
        if (tile) {
            const index = y * this.world.getWidth() + x;
            
            if (this.tileMap[index]) {
                // Update the texture of the sprite
                this.tileMap[index].setTexture(this.world.getTileTextureKey(tile.terrainType));
            }
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
