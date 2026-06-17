/**
 * Represents the game world, which is a multidimensional array of tiles.
 */
import { TerrainType } from './TerrainType';
import type { Tile } from './Tile';

export const DEFAULT_WORLD_SIZE = { x: 64, y: 64 };

export class World {
    /**
     * The width of the world in tiles
     */
    private width: number;
    
    /**
     * The height of the world in tiles
     */
    private height: number;
    
    /**
     * The 2D array of tiles that make up the world
     */
    private tiles: Tile[][];
    
    /**
     * Creates a new World with the specified dimensions
     * @param width The width of the world in tiles
     * @param height The height of the world in tiles
     */
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        
        // Initialize the 2D array with empty tiles
        for (let x = 0; x < width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < height; y++) {
                this.tiles[x][y] = {
                    id: `${x}-${y}`,
                    x: x,
                    y: y,
                    terrainType: TerrainType.EMPTY
                };
            }
        }
    }
    
    /**
     * Gets the width of the world
     */
    getWidth(): number {
        return this.width;
    }
    
    /**
     * Gets the height of the world
     */
    getHeight(): number {
        return this.height;
    }
    
    /**
     * Gets a tile at the specified coordinates
     * @param x The x coordinate
     * @param y The y coordinate
     * @returns The tile at the specified coordinates, or undefined if out of bounds
     * @todo Assuming there's no use case for negative numbers, we should update this method to throw an error if X or Y are negative. Perhaps a shared error handler?
     */
    getTile(x: number, y: number): Tile | undefined {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return undefined;
        }
        return this.tiles[x][y];
    }
    
    /**
     * Sets a tile at the specified coordinates
     * @param x The x coordinate
     * @param y The y coordinate
     * @param tile The tile to set
     * @todo Assuming there's no use case for negative numbers, we should update this method to throw an error if X or Y are negative. Perhaps a shared error handler?
     */
    setTile(x: number, y: number, tile: Tile): void {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        this.tiles[x][y] = tile;
    }
    
    /**
     * Gets the entire 2D array of tiles
     */
    getTiles(): Tile[][] {
        return this.tiles;
    }
    

    // FUTURE: Why was this function generated?
    // My understanding is that it interfaces with PP-2, based on the plans from the Qwen session that generated this.
    /**
     * Updates all tiles in the world with a provided function
     * @param updateFn The function to apply to each tile
     */
    updateAllTiles(updateFn: (tile: Tile) => Tile): void {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.tiles[x][y] = updateFn(this.tiles[x][y]);
            }
        }
    }

    /**
     * Fill a World object with tiles. Currently, this simply generates a variety of random tiles for testing.
     * FUTURE: Add an argument for which mode we'll use to populate the world. The current one will be a "generate new world" method.
     * We'll also want to add a "load from save" method.
     */
    populateWorld()
    {
        for (let x = 0; x < this.getWidth(); x++) {
            for (let y = 0; y < this.getHeight(); y++) {

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
                
                const tile = this.getTile(x, y);
                if (tile) {
                    tile.terrainType = terrainType;
                }
            }
        }
    }

    /* Map terrain types to texture keys */
    public getTileTextureKey(terrainType: TerrainType): string {
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
}