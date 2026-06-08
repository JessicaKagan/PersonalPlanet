import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { World } from '../world/World';
import { TerrainType } from '../world/TerrainType';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    world: World;
    tileMap: Phaser.GameObjects.TileSprite[] = [];

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        // Create a new world with a small test grid (10x10)
        this.world = new World(10, 10);
        
        // Fill the world with some test tiles
        this.populateWorld();
        
        // Render the world
        this.renderWorld();

        EventBus.emit('current-scene-ready', this);
    }

    populateWorld()
    {
        // Fill the world with different terrain types for testing
        for (let x = 0; x < this.world.getWidth(); x++) {
            for (let y = 0; y < this.world.getHeight(); y++) {
                // Create a simple pattern of terrain types
                let terrainType: TerrainType;
                
                if (x < 3 && y < 3) {
                    terrainType = TerrainType.OCEAN;
                } else if (x >= 7 && y >= 7) {
                    terrainType = TerrainType.TUNDRA;
                } else if (x > 3 && x < 7 && y > 3 && y < 7) {
                    terrainType = TerrainType.GRASSLAND;
                } else {
                    // Random terrain for the rest
                    const terrainTypes = [
                        TerrainType.FRESHWATER,
                        TerrainType.POLAR,
                        TerrainType.TAIGA,
                        TerrainType.COLD_DESERT,
                        TerrainType.STEPPE,
                        TerrainType.TEMPERATE_FOREST,
                        TerrainType.TEMPERATE_SWAMP,
                        TerrainType.HOT_DESERT,
                        TerrainType.TROPICAL_GRASSLAND,
                        TerrainType.TROPICAL_FOREST
                    ];
                    terrainType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
                }
                
                const tile = this.world.getTile(x, y);
                if (tile) {
                    tile.terrainType = terrainType;
                }
            }
        }
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
                    const tileSprite = this.add.image(
                        x * tileSize,
                        y * tileSize,
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


    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
