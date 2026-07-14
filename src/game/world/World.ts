/**
 * Represents the game world, which is a multidimensional array of tiles.
 */
import { TerrainType } from './TerrainType';
import type { Tile } from './Tile';
import { createNoise2D } from 'simplex-noise';

export const DEFAULT_WORLD_SIZE = { x: 64, y: 64 };
/** 1.361 kilowatts per square meter */
export const DEFAULT_SOLAR_CONSTANT = 1361;
/** 32768 meters */
export const DEFAULT_MAXIMUM_ALTITUDE = Math.pow(2, 15);
/** 16384 meters */
export const DEFAULT_SEA_LEVEL = Math.pow(2, 14);
/** No inherent meaning, because this is a relative number. */
export const DEFAULT_ROTATION_SPEED = 100;

export class World {
    /** BASIC WORLD INFORMATION */

    /** The width of the world in tiles */
    private width: number;
    
    /** The height of the world in tiles*/
    private height: number;
    
    /** The 2D array of tiles that make up the world */
    private tiles: Tile[][];

    /** CLIMATE INFORMATION */
    
    /** The amount of sunlight a World gets. The default value resembles the solar constant of Earth in watts per square meter.*/
    private insolation: number;
    /** The average sea level of a World. Tiles with heights below this should be assigned TerrainType.OCEAN. */
    private seaLevel: number;
    /** How quickly the world rotates. This is an arbitrary percentage. */
    private rotationSpeed: number;
    
    /**
     * Create a new, empty World object.
     * @param width The width of the world in tiles
     * @param height The height of the world in tiles
     */
    constructor(
        width: number,
        height: number,
        insolation: number = DEFAULT_SOLAR_CONSTANT,
        seaLevel: number = DEFAULT_SEA_LEVEL,
        rotationSpeed: number = DEFAULT_ROTATION_SPEED
    ){
        this.width = width;
        this.height = height;
        this.insolation = insolation;
        this.seaLevel = seaLevel;
        this.rotationSpeed = rotationSpeed;

        this.tiles = [];
        
        // Initialize the 2D array with empty tiles
        for (let x = 0; x < width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < height; y++) {
                this.tiles[x][y] = {
                    id: `${x}-${y}`,
                    x: x,
                    y: y,
                    terrainType: TerrainType.EMPTY,
                    temperature: 0,
                    albedo: 0,
                    humidity: 0,
                    elevation: 0
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
    // This could actually be helpful for running a simulation function on the world, such as any methods we want to implement
    // in PP-4 onwards.
    /**
     * Updates all tiles in the world with a provided function
     * @param updateFn The function to apply to each tile
     */
    public updateAllTiles(updateFn: (tile: Tile) => Tile): void {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.tiles[x][y] = updateFn(this.tiles[x][y]);
            }
        }
    }

    /**
     * Fill a World object with tiles. The methods here are loosely pulled from https://www.redblobgames.com/maps/terrain-from-noise/.
     * FUTURE: Add an argument for which mode we'll use to populate the world. The current one will be a "generate new world" method.
     * We'll also want to add a "load from save" method.
     */
    public populateWorld(): void {
        const simplexNoise = createNoise2D();
        
        this.updateAllTiles(tile => {
            // Generate an initial height for each tile by mashing together and convoluting a few polled simplex noise targets.
            let noiseFrequencies = {
                large: simplexNoise(1042, (tile.x * this.width) + tile.y),
                medium: simplexNoise(512, (tile.x * this.width) + tile.y),
                small: simplexNoise(256, (tile.x * this.width) + tile.y),
            } 
            
            const combinedNoiseResult = (noiseFrequencies.small + noiseFrequencies.medium + noiseFrequencies.large) / (1 + 0.5 + 0.25);
            const poweredNoiseResult = Math.pow(combinedNoiseResult, 2);

            let elevationVariance = combinedNoiseResult > 0 ?
                Math.floor(poweredNoiseResult * 2048) :
                Math.floor(poweredNoiseResult * -2048);

            tile.elevation = this.seaLevel + elevationVariance;

            // For this step, terrain type is solely based on 
            if (tile.elevation < this.seaLevel) {
                tile.terrainType = TerrainType.OCEAN;
            } else {
                tile.terrainType = TerrainType.GRASSLAND;
            }

            return tile;
        })
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