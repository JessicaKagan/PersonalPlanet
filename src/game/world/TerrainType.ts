/**
 * Enum representing different types of terrain in the game world.
 * The initial plan is that these should represent biomes.
 */
export enum TerrainType {
    /**
     * Empty or undefined terrain
     */
    EMPTY,

    /** Water terrains */

    OCEAN,
    ICE_CAP,

    /** Lakes, possibly rivers? */
    FRESHWATER,

    /** Cold land terrains */

    POLAR, 
    TUNDRA,
    TAIGA,
    COLD_DESERT,

    /** Middling temperature land terrains */

    STEPPE,
    GRASSLAND,
    TEMPERATE_FOREST,
    TEMPERATE_SWAMP,

    /** Hot land terrains */

    HOT_DESERT,
    TROPICAL_GRASSLAND,
    TROPICAL_FOREST,
    TROPICAL_SWAMP

}