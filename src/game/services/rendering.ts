/** A home for the methods used to render graphics based on the current game and simulation state. */
import { TerrainType } from '../world/TerrainType';
import type { World } from '../world/World';

/** Update the visual representation of a tile in the world.
 * As of PP-4-2, this currently only updates tile textures.
 * @param tileSprite A Phaser tileSprite, which crucially contains the custom data we added in renderInitialWorld().
 */
export function updateTileVisual(world: World, tileSprite: Phaser.GameObjects.TileSprite): void {
    // TODO: Can we find a way to do this without importing the entire world?
    const tile = world.getTile(tileSprite.getData('worldX'), tileSprite.getData('worldY'));

    if (!tile) {
        return;
    }

    // The tileSprite is passed by reference, so we can update the contents of tileSpriteMap without having to mess with array indices et al.
    tileSprite.setTexture(getTileTextureKey(tile.terrainType));
}

/* Map terrain types to texture keys. */
export function getTileTextureKey(terrainType: TerrainType): string {
    switch (terrainType) {
        case TerrainType.OCEAN:
            return 'ocean';
        case TerrainType.ICE_CAP:
            return 'ice';
        case TerrainType.FRESHWATER:
            return 'shallow water';
        case TerrainType.POLAR:
            return 'snow';
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