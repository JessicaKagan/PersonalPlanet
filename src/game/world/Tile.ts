/**
 * Represents a single tile in the game world.
 * As of PP-1 (06/03/2026), a world in Personal Planet is a rectangular array of tiles.
 */
import type { Lifeform } from './Lifeforms';
import { TerrainType } from './TerrainType';

export type LifeformsInTile = {
    type: Lifeform,
    count: number
}

export interface Tile {
    /** BASIC TILE INFORMATION */
    /** Unique identifier for the tile. */
    id: string;
    
    /** X coordinate of the tile in the world grid. */
    x: number;
    
    /** Y coordinate of the tile in the world grid. */
    y: number;
    
    /**
     * Type of terrain this tile represents
     */
    terrainType: TerrainType;
    
    /**
     * The visual representation of this tile (Phaser game object)
     * FUTURE: The image for a tile is separate from the TerrainType.
     * Amongst other things, this potentially means we can have multiple
     * variants for terrain tiles. However, having these decoupled can also
     * introduce bugs where the graphics don't match the internal representation
     * of the tile. We should investigate this.
     */
    gameObject?: Phaser.GameObjects.Image;

    /** CLIMATE DATA */

    /** The average temperature of a tile. At this level, use Kelvin scale numbers to make for simpler math. */
    temperature: number;
    /** How much radiation (in practice, sunlight) the tile reflects. A percentage between 0-100%. */
    albedo: number;
    /** How much water is in the atmosphere above a tile. A percentage between 0-100%.
     *  FUTURE: The relationship between maximum humidity and temperature is complex, so we may want to switch to a more absolute measurement someday. */
    humidity: number;
    /** The average relative height of a tile in meters. Use positive numbers here, probably capped to a maximum of 2^15 meters for versimilitude. */
    elevation: number;
    /** The lifeforms present in a tile. */
    life: LifeformsInTile[];
}

/** A shorthand function for determining whether a tile represents a water biome.
 * This was added in order to make life layer logic easier to read.
 */
export function isTileAquatic(tile: Tile): boolean {
    return tile.terrainType === TerrainType.OCEAN || tile.terrainType === TerrainType.ICE_CAP || tile.terrainType === TerrainType.FRESHWATER;
}