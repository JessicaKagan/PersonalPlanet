/**
 * Represents the game world, which is a multidimensional array of tiles.
 */
import { matrix, mean, pickRandom } from 'mathjs';
import { TerrainType } from './TerrainType';
import { isTileAquatic, type Tile } from './Tile';
import { createNoise2D } from 'simplex-noise';
import { INITIAL_CHARACTER_COUNT_FOR_WORLDGEN, SAFE_AVERAGE_TEMPERATURE, WATER_FREEZING_TEMPERATURE } from '../defines/core_defines';
import { DEFAULT_LIFEFORMS } from '../defines/lifeforms';
import { getBiomassForTile, getLifeformSizeWeightForCharacter, getSizeMultiplierForInitialLifeformCount, isLifeformValidCharacter } from './Lifeforms';

import * as MathService from '../services/math';
import * as UtilitiesService from '../services/utilities';
import { Character } from '../characters/Character';

export const DEFAULT_WORLD_SIZE = { x: 128, y: 64 };
/** 1.361 kilowatts per square meter */
export const DEFAULT_SOLAR_CONSTANT = 1361;
/** 32768 meters */
export const DEFAULT_MAXIMUM_ALTITUDE = Math.pow(2, 15);
/** 16384 meters */
export const DEFAULT_SEA_LEVEL = Math.pow(2, 14);
/** No inherent meaning, because this is a relative number. */
export const DEFAULT_ROTATION_SPEED = 100;
/** The percentage of World heat that radiates from the surface, through the World's atmosphere and into space. */
export const DEFAULT_SURFACE_THERMAL_RADIATION = 15;

// FUTURE: Investigate if there's any reason to have separate noise functions across components in Personal Planet.
// If not, we should move this somewhere more central.
const simplexNoise = createNoise2D();

export class World {
    /** BASIC WORLD INFORMATION */

    /** The width of the world in tiles. */
    public readonly width: number;

    /** The height of the world in tiles. */
    public readonly height: number;

    /** The middle latitude of the world, derived from its height. */
    public readonly equator: number;
    
    /** CLIMATE INFORMATION */
    
    /** The amount of sunlight a World gets. The default value resembles the solar constant of Earth in watts per square meter.*/
    public readonly insolation: number;
    /** The average sea level of a World. Tiles with heights below this should be assigned TerrainType.OCEAN. */
    public readonly seaLevel: number;
    /** How quickly the world rotates. This is an arbitrary percentage. */
    public readonly rotationSpeed: number;
    
    /** The 2D array of tiles that make up the world. */
    private tiles: Tile[][];

    /** The simulation-level of each character in the user's world.
     * @note These aren't strictly tied to specific tiles, unlike lifeforms/biomass in aggregate.
     */
    characters: Character[] = [];

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

        this.equator = this.height / 2;

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
                    elevation: 0,
                    life: [],
                    biomass: 0
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

    public getDistanceFromEquator(tile: Tile) {
        return Math.abs(tile.y - this.equator);
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
     * Fill the player's world with initial tiles, lifeforms, characters, etc.
     * The terrain generation methods here are loosely pulled from https://www.redblobgames.com/maps/terrain-from-noise/.
     * FUTURE: Add an argument for which mode we'll use to populate the world. The current one will be a "generate new world" method.
     * We'll also want to add a "load from save" method.
     * FUTURE: When generating a new world, we may want to run some simulation ticks to further smooth out layers (most likely the lifeform layer)
     * before showing results to the player.
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
        this.updateAllTiles(tile => this.updateTileAlbedo(tile));

        // From there, seed the world with its initial lifeforms.
        this.updateAllTiles(tile => this.populateInitialTileLife(tile));

        // Then, generate an initial selection of characters for the world.
        this.populateInitialCharacters();
    }
    
    /** Generate an initial height for each tile.
     *  As of 7/21/2026, we start with a random value derived from simplex noise, and then adjust based on latitude.
     */
    private populateInitialTileHeight(tile: Tile): Tile {
        let noiseFrequencies = {
            large: simplexNoise(1024, (tile.x * this.width) + tile.y),
            medium: simplexNoise(512, (tile.x * this.width) + tile.y),
            small: simplexNoise(256, (tile.x * this.width) + tile.y),
        };

        const combinedNoiseResult = (noiseFrequencies.small + noiseFrequencies.medium + noiseFrequencies.large) / (1 + 0.5 + 0.25);
        const poweredNoiseResult = Math.pow(combinedNoiseResult, 2);

        // I like the look of worldgen more if tiles are slightly higher towards the equator, and lower towards the poles.
        let randomElevationVariance = combinedNoiseResult > 0 ?
            Math.floor(poweredNoiseResult * 2048) :
            Math.floor(poweredNoiseResult * -2048);
        let latitudeVariance = Math.floor((Math.cos(Math.PI * (this.getDistanceFromEquator(tile) / this.height)) * 128) - 32);

        tile.elevation = this.seaLevel + randomElevationVariance - latitudeVariance;

        return tile;
    }

    /** Generate an initial temperature for each tile. As of PP-4-1, the tile temperature is a function of both distance from the equator
     * and height above sea level, but there's a great deal of room to expand on this.
     */
    private populateInitialTileTemperature(tile: Tile): Tile {
        // Start with a placeholder average temperature (40°C).
        // FUTURE: Replace this hardcoded value with something we can calculate based on the solar constant or similar.
        const baseTemperature = 313;

        /** For PP-4-1, our initial latitude -> temperature relation is to arbitrarily assume that the poles are about 50 °C colder than the equator. */
        const temperatureReductionFactor = Math.sin(Math.PI * (this.getDistanceFromEquator(tile) / this.height));
        const temperatureReductionFromLatitude = Math.pow(temperatureReductionFactor, 2) * 50;

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

    /** Generate an initial Lifeform population for each tile. */
    private populateInitialTileLife(tile: Tile): Tile {
        /**
         * To populate the initial Lifeforms for a tile:
         * 1. Choose a subset of Lifeforms to use. We need to hard-filter out any life that's incapable of surviving on this tile,
         * and then select a small amount of them randomly.
         */
        let validLifeformsForTile = DEFAULT_LIFEFORMS.filter(lifeform => {
            return isTileAquatic(tile) ? lifeform.isAquatic : !lifeform.isAquatic;
        });

        UtilitiesService.shuffleArray(validLifeformsForTile);

        let lifeTypesToPopulate = 0;

        // FUTURE: As we define more lifeforms, we should reduce the percentage of initial lifeform types seeded in each tile.
        if (Math.floor(validLifeformsForTile.length * 0.25) < 5) {
            lifeTypesToPopulate = 5;
        } else {
            lifeTypesToPopulate = Math.floor(validLifeformsForTile.length * 0.25);
        }

        if (validLifeformsForTile.length > lifeTypesToPopulate) {
            validLifeformsForTile.length = lifeTypesToPopulate;
        };

        /**
         * 2. For each type of lifeform we've chosen, determine how many to add based on the lifeform's size, 
         * as well as how hospitable the tile is for that type of life. We should randomize this value by nudging it by about 5-10% of its value.
         */
        validLifeformsForTile.forEach(lifeForm => {
            const initialCount = getSizeMultiplierForInitialLifeformCount(lifeForm.size);
            const divergenceFromPreferredTemperature = Math.abs(lifeForm.preferredTemperature - tile.temperature);
            const divergenceFromPreferredHumidity = lifeForm.isAquatic ? 0 : Math.abs(lifeForm.preferredHumidity - tile.humidity);

            let climateMismatchReductionFactor;
            // For now, each degree Kelvin away from the preferred temperature reduces the count by 5%,
            // and each percentage away from preferred humidity reduces the count by 2%.
            // FUTURE: These values are subject to change and will probably become stricter over time.
            const temperatureMismatchReductionPercentage = (100 - (divergenceFromPreferredTemperature * 5 * lifeForm.temperatureHardinessFactor)) / 100;
            const humidityMismatchReductionPercentage = (100 - (divergenceFromPreferredHumidity * 0.25 * lifeForm.humidityHardinessFactor)) / 100;

            if (temperatureMismatchReductionPercentage < 0 || humidityMismatchReductionPercentage < 0) {
                climateMismatchReductionFactor = 0;
            } else {
                climateMismatchReductionFactor = temperatureMismatchReductionPercentage * humidityMismatchReductionPercentage;
            }

            const lifeFormCount = Math.round(initialCount * climateMismatchReductionFactor * (0.9 + (Math.random() * 0.2)));

            if (lifeFormCount > 0) {
                tile.life.push({
                    type: lifeForm,
                    count: lifeFormCount
                });
            }
        });

        /** After populating the lifeforms, record the tile's biomass. */
        tile.biomass = getBiomassForTile(tile.life);

        return tile;
    }

    /** Generate a selection of characters living in the World.
     * @note We currently only attempt to generate characters in tiles that already have life present, which may change in the future.
     */
    private populateInitialCharacters(): void {
        // FUTURE: It's currently possible for a round of character generation to whiff if, for instance, we choose a tile that has no lifeforms.
        // We should decide if we'd rather make X attempts at creating characters early on and accept a potentially lower creature count,
        // or if we should attempt to continue character generation using a do-while loop until we reach either our target character count,
        // or (to prevent infinite loops) we reach the maximum number of allowed attempts.
        // In both cases, we should iterate on this logic further by preventing character generation in tiles without valid targets.
        for (let i = 0; i <= INITIAL_CHARACTER_COUNT_FOR_WORLDGEN; ++i) {
            const x =  Math.floor(Math.random() * this.width);
            const y =  Math.floor(Math.random() * this.height);

            const validLifeformsForTile = this.tiles[x][y].life.filter(lifeform => isLifeformValidCharacter(lifeform.type));

            if (validLifeformsForTile.length == 0) {
                continue;
            }

            const weightsForLifeformSize = validLifeformsForTile.map(lifeform => getLifeformSizeWeightForCharacter(lifeform.type.size));
            const lifeFormForCharacter = pickRandom(validLifeformsForTile, 1, weightsForLifeformSize)[0];
            
            const character = new Character({
                name: `Character ${i}`, // FUTURE: We'll come up with a greater variety of names. We just need something for testing.
                species: lifeFormForCharacter.type,
                spriteKey: '', // FUTURE: We'll create a real value when we start rendering lifeforms.
                timeCreated: Date.now(),
                isProtected: false,
                x,
                y
            });

            this.characters.push(character);
        }        
    }

    /** Update the overall climate of the world on a per tile basis.
     * FUTURE: I'd like to work towards making the math here more realistic over time, but it's not a strict requirement.
     * That being said, in order to use the solar constant and thermal rotation constants, we'd apparently need to set up
     * and (approximately) solve a differential equation representing the energy balance of a tile, or even the whole world.
     * I haven't learned enough math to understand that yet, so we'll revisit this in the future. 
     */
    public updateClimate(): void {
        const oldTemperatureMap = matrix(this.tiles.map(row => row.map(tile => tile.temperature)));
        const averageWorldTemperature = Number(mean(oldTemperatureMap));
        
        // Heating (due to insolation) and cooling are treated as separate steps.
        this.updateAllTiles(tile => {
            tile.temperature = this.heatTileForClimate(tile, averageWorldTemperature);
            return tile;
        });

        this.updateAllTiles(tile => {
            tile.temperature *= 0.999;
            return tile;
        })

        // Finally, adjust the tile's temperature delta based on the average temperature of the world.
        // In the interest of preventing catastrophic temperature feedback loops from destroying a game, we should nudge the world towards a safe temperature.
        // FUTURE: As we add more systems, this may become less necessary.
        this.updateAllTiles(tile => {
            const divergenceFromSafeTemperature = averageWorldTemperature - SAFE_AVERAGE_TEMPERATURE;
            tile.temperature += 
                divergenceFromSafeTemperature > 0 ? 
                divergenceFromSafeTemperature * 0.1 :
                divergenceFromSafeTemperature * -0.1;
            return tile;
        });
    }

    /** Compute the change in a tile's temperature based on the world conditions.
     * Some values are inspired by https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/.
     */
    private heatTileForClimate(tile: Tile, solarConstant = DEFAULT_SOLAR_CONSTANT): number {
        // The amount of heating coming in is based off DEFAULT_SOLAR_CONSTANT in combination with the tile's latitude.
        // Assume the equator gets 100% of the increase, poles get 40% of the increase, and everywhere else somewhere in between.
        let latitudeVariance = (Math.cos(Math.PI * (this.getDistanceFromEquator(tile) / this.height)) * 0.6) + 0.4;
        const baseTemperatureIncrease = (solarConstant / 1000) * latitudeVariance;
        
        // Reduce that value based on the albedo.
        const albedoReduction = (100 - tile.albedo) / 100;
        const netTemperatureIncrease = baseTemperatureIncrease * albedoReduction;

        
        // FUTURE: We may want to account for the atmosphere of the player's World reflecting/radiating energy.
        // This would reduce heating further.
        return tile.temperature + netTemperatureIncrease;
    }

    /** Update the terrain of a tile based on its current metadata. */
    public updateTileTerrain(tile: Tile): Tile {
        // Ocean simulation is simple for now - just go by the current sea level and temperature!
        if (tile.elevation < this.seaLevel) {
            tile.terrainType = tile.temperature >= WATER_FREEZING_TEMPERATURE ? TerrainType.OCEAN : TerrainType.ICE_CAP;
        } else {
            // FUTURE: We have a "freshwater" terrain type defined. This will likely be helpful for water above sea level, but it might be best to handle
            // that seperately from the terrain type. This requires investigating.

            // Terrain types are currently sorted first by temperature, and then by humidity.
            // FUTURE: When we update the terrainType of a tile, we need to set its albedo!
            // Wikipedia gives us some starter values for various terrains.
            if (tile.temperature < WATER_FREEZING_TEMPERATURE) {
                tile.terrainType = TerrainType.POLAR;
            } else if (tile.temperature >= WATER_FREEZING_TEMPERATURE && tile.temperature < 283) { // 0-10°C
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

    /** Update the albedo of a tile based on its terrain type.
     * FUTURE: This method might change as we add additional layers to the simulation.
     */
    public updateTileAlbedo(tile: Tile): Tile {
        switch (tile.terrainType) {
            case TerrainType.ICE_CAP:
            case TerrainType.POLAR:
                tile.albedo = 60;
                break;
            case TerrainType.COLD_DESERT:
            case TerrainType.HOT_DESERT:
            case TerrainType.TUNDRA:
                tile.albedo = 40;
                break;
            case TerrainType.STEPPE:
            case TerrainType.GRASSLAND:
            case TerrainType.TROPICAL_GRASSLAND:
                tile.albedo = 25;
                break;
            case TerrainType.TEMPERATE_FOREST:
            case TerrainType.TROPICAL_FOREST:
            case TerrainType.TEMPERATE_SWAMP:
            case TerrainType.TROPICAL_SWAMP:
                tile.albedo = 18;
                break;
            case TerrainType.TAIGA:
                tile.albedo = 15;
                break;
            case TerrainType.OCEAN:
            case TerrainType.FRESHWATER:
                tile.albedo = 6;
                break;
            case TerrainType.EMPTY:
            default:
                tile.albedo = 0;
                break;
        }
        return tile;
    }

    /** Smooth out the height variations in the player's world using a box blur.
     * @param blurFactor The number of tiles to blur in each direction
     */
    public erodeWorld(blurFactor: number = 3): void {
        const smoothedElevations = MathService.boxBlur(matrix(this.tiles.map(row => row.map(tile => tile.elevation))), blurFactor);

        smoothedElevations.forEach((value: number, tileIndex: number[]) => {
            this.tiles[tileIndex[0]][tileIndex[1]].elevation = Number(value);
        });
    }
}