/**
 * Represents the game world, which is a multidimensional array of tiles.
 */
import { index, larger, matrix, mean, range, smaller } from 'mathjs';
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

    /** The width of the world in tiles. */
    public readonly width: number;

    /** The height of the world in tiles. */
    public readonly height: number;
    
    /** CLIMATE INFORMATION */
    
    /** The amount of sunlight a World gets. The default value resembles the solar constant of Earth in watts per square meter.*/
    public readonly insolation: number;
    /** The average sea level of a World. Tiles with heights below this should be assigned TerrainType.OCEAN. */
    public readonly seaLevel: number;
    /** How quickly the world rotates. This is an arbitrary percentage. */
    public readonly rotationSpeed: number;
    
    /** The 2D array of tiles that make up the world */
    private tiles: Tile[][];

    /**
     * Create a new, empty World object.
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
     * FUTURE: This currently only runs a single function on each tile. We should update this to take an array of functions instead.
     * @warning This function was generated from a Qwen + Zoo Code session.
     * @param callbackFunction The function to apply to each tile
     */
    public updateAllTiles(callbackFunction: (tile: Tile) => Tile): void {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.tiles[x][y] = callbackFunction(this.tiles[x][y]);
            }
        }
    }

    /**
     * Fill a World object with tiles. The methods here are loosely pulled from https://www.redblobgames.com/maps/terrain-from-noise/.
     * FUTURE: Add an argument for which mode we'll use to populate the world. The current one will be a "generate new world" method.
     * We'll also want to add a "load from save" method.
     */
    public populateWorld(): void {
        // Tile data is derived from a mixture of randomized sources (noise) and formulas running on these values.
        this.updateAllTiles(tile => this.populateInitialTileHeight(tile));
        this.updateAllTiles(tile => this.populateInitialTileHumidity(tile));
        this.updateAllTiles(tile => this.populateInitialTileTemperature(tile));

        // Run some post-processing to make the world less jagged looking. This significantly affects how pleasing the world looks.
        this.erodeWorld();

        // After the tiles' climate metadata has been generated to our liking, we should have enough information to derive the tile's terrain.
        this.updateAllTiles(tile => this.updateTileTerrain(tile));
    }
    
    /** Generate an initial height for each tile by mashing together and convoluting a few polled simplex noise targets. */
    private populateInitialTileHeight(tile: Tile): Tile {
        let noiseFrequencies = {
            large: simplexNoise(1024, (tile.x * this.width) + tile.y),
            medium: simplexNoise(512, (tile.x * this.width) + tile.y),
            small: simplexNoise(256, (tile.x * this.width) + tile.y),
        };

        const combinedNoiseResult = (noiseFrequencies.small + noiseFrequencies.medium + noiseFrequencies.large) / (1 + 0.5 + 0.25);
        const poweredNoiseResult = Math.pow(combinedNoiseResult, 2);

        let elevationVariance = combinedNoiseResult > 0 ?
            Math.floor(poweredNoiseResult * 2048) :
            Math.floor(poweredNoiseResult * -2048);

        tile.elevation = this.seaLevel + elevationVariance;

        return tile;
    }

    /** Generate an initial temperature for each tile. As of PP-4-1, the tile temperature is a function of both distance from the equator
     * and height above sea level, but there's a great deal of room to expand on this.
     */
    private populateInitialTileTemperature(tile: Tile): Tile {
        // Start with a placeholder average temperature (40°C).
        // FUTURE: Replace this hardcoded value with something we can calculate based on the solar constant or similar.
        const baseTemperature = 313;

        /** For PP-4-1, our initial latitude -> temperature relation is to arbitrarily assume that the poles are about 60 °C colder than the equator. */
        const equator = this.height / 2;
        const distanceFromEquator = Math.abs(tile.y - equator);
        const temperatureReductionFactor = Math.sin(Math.PI * (distanceFromEquator / this.height));
        const temperatureReductionFromLatitude = Math.pow(temperatureReductionFactor, 2) * 60;

        /** For PP-4-1, our initial elevation -> temperature relation is based on the the adiabatic lapse rate (9.8 °C per kilometer above sea level). */ 
        const elevationAboveSeaLevel = tile.elevation >= this.seaLevel ? tile.elevation - this.seaLevel : 0;
        const temperatureReductionFromElevation = elevationAboveSeaLevel * (9.8 / 1000);

        /** For PP-4-1, add a small random nudge to the temperature for more interesting ice cap patterns. */
        const randomTemperatureDelta = simplexNoise(1024, (tile.x * this.width) + tile.y) * 5;

        tile.temperature = baseTemperature - temperatureReductionFromLatitude - temperatureReductionFromElevation + randomTemperatureDelta;
        return tile;
    }

    /** Generate an initial humidity for each tile. This uses a simplex noise map, similar to populateInitialTileHeight, but with less convolution.
     * FUTURE: Figure out a way to infer humidity from the world, instead of simply using a random value.
     */
    private populateInitialTileHumidity(tile: Tile): Tile {
        let noiseFrequencies = {
            large: simplexNoise(1024, (tile.x * this.width) + tile.y),
            medium: simplexNoise(512, (tile.x * this.width) + tile.y),
            small: simplexNoise(256, (tile.x * this.width) + tile.y),
        };
        
        // BUG: This can end up above 1 or below -1. What's causing this?
        const combinedNoiseResult = (noiseFrequencies.small + noiseFrequencies.medium + noiseFrequencies.large) / (1 + 0.5 + 0.25);

        tile.humidity = Math.floor(Math.abs(combinedNoiseResult) * 100);
        
        return tile;
    }

    public updateTileTerrain(tile: Tile): Tile {
        // Ocean simulation is simple for now - just go by the current sea level and temperature!
        if (tile.elevation < this.seaLevel) {
            tile.terrainType = tile.temperature >= 273 ? TerrainType.OCEAN : TerrainType.ICE_CAP;
        } else {
            // FUTURE: We have a "freshwater" terrain type defined. This will likely be helpful for water above sea level, but it might be best to handle
            // that seperately from the terrain type. This requires investigating.

            // Terrain types are currently sorted first by temperature, and then by humidity.
            if (tile.temperature < 273) {
                tile.terrainType = TerrainType.POLAR;
            } else if (tile.temperature >= 273 && tile.temperature < 283) { // 0-10°C
                tile.terrainType = 
                    tile.humidity > 50 ? TerrainType.TAIGA : 
                    tile.humidity > 25 ? TerrainType.TUNDRA :
                TerrainType.COLD_DESERT;
            } else if (tile.temperature >= 283 && tile.temperature < 303) { // 10-30°C
                tile.terrainType = 
                    tile.humidity > 75 ? TerrainType.TEMPERATE_SWAMP : 
                    tile.humidity > 50 ? TerrainType.TEMPERATE_FOREST: 
                    tile.humidity > 25 ? TerrainType.GRASSLAND :
                    TerrainType.STEPPE;
            } else if (tile.temperature >= 303) { // >30°C
                tile.terrainType = 
                    tile.humidity > 75 ? TerrainType.TROPICAL_SWAMP : 
                    tile.humidity > 50 ? TerrainType.TROPICAL_FOREST: 
                    tile.humidity > 25 ? TerrainType.TROPICAL_GRASSLAND :
                    TerrainType.HOT_DESERT;
            }
        }

        return tile;
    }

    /** Given the elevations of each tile in the user's World, return a smoothed out version
     * using a box blur to average each tile's height with its nearby neighbors.
     * The box blur is potentially handy enough for other tile properties that we should really split it off into a utility function somewhere.
     * @param blurFactor The number of tiles to blur in each direction
     */
    public erodeWorld(blurFactor: number = 3): void {
        const elevationMap = matrix(this.tiles.map(row => row.map(tile => tile.elevation)));

        // When called this way, matrix.forEach() gives us the value of each element in the matrix, as well as its index (as an array with X and Y coordinates).
        elevationMap.forEach((value: number, tileIndex: number[]) => {
            // First, get the blurrable radius of each tile. This is usually equivalent to a square where each side's length is blurFactor * 2,
            // but with Tile indices outside the World filtered out. 
            const x = tileIndex[0], y = tileIndex[1];
            const rangesForBlurring = {
                x: range(x - blurFactor, x + blurFactor).toArray().filter(x => {
                    return larger(x, 0) && smaller(x, this.width);
                }),
                y: range(y - blurFactor, y + blurFactor).toArray().filter(y => {
                    return larger(y, 0) && smaller(y, this.height);
                })
            };

            // Then, average together all the values in the tile's blurrable radius.
            const heightsForBlurring = elevationMap.subset(index(rangesForBlurring.x, rangesForBlurring.y));
            const averageHeight = mean(heightsForBlurring);

            this.tiles[x][y].elevation = Number(averageHeight);
        });
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