/** A home for the methods used to render graphics based on the current game and simulation state. */
import type { Scene } from 'phaser';
import { DEFAULT_TILE_SIZE, GraphicsOverlays } from '../defines/core_defines';
import { TerrainType } from '../world/TerrainType';
import type { World } from '../world/World';
import { BIOMASS_COLOR } from '../defines/rendering_defines';

/** Each overlay in Personal Planet potentially requires us to track a variety of graphical elements.
 * The OverlayMap allows us to bundle together and update any relevant overlay graphics in one pass.
 */
export interface OverlayMap {
    shapes: Phaser.GameObjects.Shape[];
    sprites: Phaser.GameObjects.Sprite[];
    tileSprites: Phaser.GameObjects.TileSprite[];
}

/** Use the current state of the simulation to generate relevant overlay graphics objects for Phaser to render whenever the game scene updates.
 * FUTURE: Investigate how we can this method (or at least as much of it as reasonably possible) to RenderingService.
 * @warning For performance reasons, you should only call this method if the user changes their overlay, or in response to relevant updateSimulation() calls.
 * @param overlayMap A reference to overlayMap in the Game scene.
 * @param overlayType The overlay that needs graphics generated
 * @param world A reference to the player's world, and therefore the data we need to visualize
 * @param scene A reference to the current scene, so we can add graphics objects to the scene
 */
export function updateOverlayMap(overlayMap: OverlayMap, overlayType: GraphicsOverlays, world: World, scene: Scene): void {
    // FUTURE: Simple shapes should be cleaned up and regenerated whenever we update the overlay map.
    // On the other hand, we may want to deactivate (setActive((false)) more complex objects and make them invisible,
    // in case we still want to keep track of them. This will require further research and planning.
    overlayMap.shapes.forEach(shape => shape.destroy());
    overlayMap.shapes = [];

    switch (overlayType) {
        case GraphicsOverlays.Lifeforms:
            overlayMap.shapes = getShapesForLifeformsLayer(world, scene);
        case GraphicsOverlays.None:
        default:
            break;
    }
}

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

/** Generate the shapes for the lifeforms overlay - a translucent green square for any tile that has life in it.
 */
function getShapesForLifeformsLayer(world: World, scene: Scene): Phaser.GameObjects.Shape[] {
    const biomassShapes: Phaser.GameObjects.Shape[] = [];
    const tiles = world.getTiles().flat().filter(tile => tile.biomass > 0);

    // The tile(s) with the highest biomass get the highest opacity (50%).
    const maximumBiomass = Math.max(...tiles.map(tile => tile.biomass));

    /** TODO: It looks like there's a significant performance cost to generating a bunch of shapes.
     * Using a prebaked "overlay" (really, just a green square) will perform significantly better, so let's update that ASAP. */
    for(let tile of tiles) {
        const opacity = (tile.biomass / maximumBiomass) * 0.5;
        const biomassRectangle = scene.add.rectangle(
            tile.x * DEFAULT_TILE_SIZE,
            tile.y * DEFAULT_TILE_SIZE,
            DEFAULT_TILE_SIZE,
            DEFAULT_TILE_SIZE,
            BIOMASS_COLOR,
            opacity
        );

        biomassShapes.push(biomassRectangle);
    }

    return biomassShapes;
}
