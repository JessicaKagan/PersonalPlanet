/**
 * Represents the game world, which is a multidimensional array of tiles.
 */
import { TerrainType } from './TerrainType';
import type { Tile } from './Tile';
import { createNoise2D } from 'simplex-noise';

export const DEFAULT_WORLD_SIZE = { x: 128, y: 64 };
/** 1.361 kilowatts per square meter */
export const DEFAULT_SOLAR_CONSTANT = 1361;
/** 32768 meters */
export const DEFAULT_MAXIMUM_ALTITUDE = Math.pow(2, 15);
/** 16384 meters */
export const DEFAULT_SEA_LEVEL = Math.pow(2, 14);
/** No inherent meaning, because this is a relative number. */
export const DEFAULT_ROTATION_SPEED = 100;

// FUTURE: Investigate if there's any reason to have separate noise functions across components in Personal Planet.
// If not, we should move this somewhere more central.
const simplexNoise = createNoise2D();

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
    
    /**
     * Updates all tiles in the world with a provided callback function. This is helpful when you're running either world generation
     * or world simulation logic and need to update the status of the entire world.
     * @warning This function was generated from a Qwen + Zoo Code session.
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
        this.updateAllTiles(tile => this.populateInitialTileHeight(tile));
        this.updateAllTiles(tile => this.populateInitialTileTemperature(tile));
    }
    
    /** Generate an initial height for each tile by mashing together and convoluting a few polled simplex noise targets. */
    private populateInitialTileHeight(tile: Tile): Tile {
        let noiseFrequencies = {
            large: simplexNoise(1042, (tile.x * this.width) + tile.y),
            medium: simplexNoise(512, (tile.x * this.width) + tile.y),
            small: simplexNoise(256, (tile.x * this.width) + tile.y),
        };

        const combinedNoiseResult = (noiseFrequencies.small + noiseFrequencies.medium + noiseFrequencies.large) / (1 + 0.5 + 0.25);
        const poweredNoiseResult = Math.pow(combinedNoiseResult, 2);

        let elevationVariance = combinedNoiseResult > 0 ?
            Math.floor(poweredNoiseResult * 2048) :
            Math.floor(poweredNoiseResult * -2048);

        tile.elevation = this.seaLevel + elevationVariance;

        // For this step, terrain type is solely based on elevation relative to the sea level.
        // FUTURE: This step will be moved to its own function as we add more steps to worldgen.
        if (tile.elevation < this.seaLevel) {
            tile.terrainType = TerrainType.OCEAN;
        } else {
            tile.terrainType = TerrainType.GRASSLAND;
        }

        return tile;
    }

    /** Generate an initial temperature for each tile. As of PP-4-1, the tile temperature is a function of both distance from the equator
     * and height above sea level, but there's a great deal of room to expand on this.
     */
    private populateInitialTileTemperature(tile: Tile): Tile {
        // Start with a placeholder average temperature (50C).
        // FUTURE: Replace this hardcoded value with something we can calculate based on the solar constant or similar.
        const baseTemperature = 323;

        /**
         * For PP-4-1, our initial latitude -> temperature relation is to assume that the poles are 100 °C colder than the equator.
         */
        const equator = this.height / 2;
        const distanceFromEquator = Math.abs(tile.y - equator);
        const temperatureReductionFromLatitude = Math.sin(Math.PI * (distanceFromEquator / equator)) * 100;

        /** 
         * For PP-4-1, our initial elevation -> temperature relation is based on the the adiabatic lapse rate (9.8 °C per kilometer above sea level).
         * */ 
        const elevationAboveSeaLevel = tile.elevation >= this.seaLevel ? tile.elevation - this.seaLevel : 0;
        const temperatureReductionFromElevation = elevationAboveSeaLevel * (9.8 / 1000);

        tile.temperature = baseTemperature - temperatureReductionFromLatitude - temperatureReductionFromElevation;
        return tile;
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