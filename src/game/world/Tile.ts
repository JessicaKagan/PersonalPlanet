/**
 * Represents a single tile in the game world.
 * As of PP-1 (06/03/2026), a world in Personal Planet is a rectangular array of tiles.
 */
import { TerrainType } from './TerrainType';

export interface Tile {
    /**
     * Unique identifier for the tile
     */
    id: string;
    
    /**
     * X coordinate of the tile in the world grid
     */
    x: number;
    
    /**
     * Y coordinate of the tile in the world grid
     */
    y: number;
    
    /**
     * Type of terrain this tile represents
     */
    terrainType: TerrainType;
    
    /**
     * The visual representation of this tile (Phaser game object)
     */
    gameObject?: Phaser.GameObjects.Image;

    // FUTURE: What use cases are there for having arbitrary metadata in a tile?
    // We can remove this in the future if we want to discourage the pattern.
    /**
     * Additional metadata for the tile
     */
    // metadata?: {
    //     [key: string]: any;
    // };
}