import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { World } from '../world/World';
import { TerrainType } from '../world/TerrainType';

const DEFAULT_SIMULATION_TICKS_PER_SECOND = 50;
const MINIMUM_ZOOM_FACTOR = 1;
const MAXIMUM_ZOOM_FACTOR = 1 / 16;
const DEFAULT_ZOOM_TICK = Math.sqrt(2); // Using a number that "cleanly" multiplies into 2 allows the user finer zooming, while keeping the values predictable.

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    world: World;
    tileMap: Phaser.GameObjects.TileSprite[] = [];

    public updateInterval = 1000 / DEFAULT_SIMULATION_TICKS_PER_SECOND; // Update the simulation every 100ms by default.
    public timeSinceLastUpdate = 0; // Keep track of how much time has passed since the last interval.
    
    /** Generic, top level mouse input handlers which are instantiated when we create the main game scene.
     * FUTURE: Does Phaser tear down event handlers for its inputs when you leave a scene? If not, how do we handle this?
     */
    public onPointerDown?: Phaser.Input.InputPlugin; // Primarily for tracking click and drag events
    public onPointerUp?: Phaser.Input.InputPlugin;
    public onPointerMove?: Phaser.Input.InputPlugin;
    public onPointerWheel?: Phaser.Input.InputPlugin;

    public isPointerHeldDown = false;
    public isMiddleMouseHeldDown = false;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        // Create a new world with a small test grid (10x10)
        this.world = new World(10, 10);
        
        // Fill the world with some test tiles
        this.world.populateWorld();
        
        // Render the initial state of the world
        this.renderWorld();

        this.addControls();

        EventBus.emit('current-scene-ready', this);
    }

    addControls(): void {
        // TODO: We currently care more about pointer than currentlyOver, but we'll need to make sure we can get references
        // to the objects users click on.
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
            // For camera movement...
            if (this.isMiddleMouseHeldDown) {
                // ... drag the camera based on the user's mouse movement...
                const delta = {
                    x: pointer.position.x - pointer.prevPosition.x,
                    y: pointer.position.y - pointer.prevPosition.y
                };

                this.camera.setScroll(this.camera.scrollX - delta.x, this.camera.scrollY - delta.y);
                // ... TODO: then clamp to valid positions in the world.
                // console.log(this.camera.getBounds());
            }
        });

        this.input.addListener('wheel', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            // Adjust the zoom every time the mousewheel ticks.
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

    renderWorld()
    {
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
                        this.getTileTextureKey(tile.terrainType)
                    );
                    
                    // Set the sprite to be at the correct position in world space
                    tileSprite.setPosition(x * tileSize, y * tileSize);
                    tileSprite.setScale(1); // 100% zoom level
                    
                    // Store reference for potential updates
                    this.tileMap.push(tileSprite);
                }
            }
        }
    }

    getTileTextureKey(terrainType: TerrainType): string {
        // Map terrain types to texture keys
        switch (terrainType) {
            case TerrainType.OCEAN:
                return 'ocean';
            case TerrainType.ICE_CAP:
                return 'ice';
            case TerrainType.FRESHWATER:
                return 'shallow water';
            case TerrainType.POLAR:
                return 'tundra';
            case TerrainType.TUNDRA:
                return 'tundra snowy';
            case TerrainType.TAIGA:
                return 'taiga';
            case TerrainType.COLD_DESERT:
                return 'coldcliff';
            case TerrainType.STEPPE:
                return 'savannah';
            case TerrainType.GRASSLAND:
                return 'grass';
            case TerrainType.TEMPERATE_FOREST:
                return 'forest';
            case TerrainType.TEMPERATE_SWAMP:
                return 'swamp';
            case TerrainType.HOT_DESERT:
                return 'sand';
            case TerrainType.TROPICAL_GRASSLAND:
                return 'junglegrass';
            case TerrainType.TROPICAL_FOREST:
                return 'forest';
            case TerrainType.TROPICAL_SWAMP:
                return 'swamp';
            default:
                return 'ocean'; // Default fallback
        }
    }
    
    update (time: number, delta: number)
    {
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
                this.tileMap[index].setTexture(this.getTileTextureKey(tile.terrainType));
            }
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
