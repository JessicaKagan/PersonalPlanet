/**
 * Enum representing different types of terrain in the game world.
 * The initial plan is that these should represent biomes.
 */
export enum TerrainType {
    /**
     * Empty or undefined terrain
     */
    EMPTY = "Void",

    /** Water terrains */

    OCEAN = "Ocean",
    ICE_CAP = "Ice Cap",

    /** Lakes, possibly rivers? */
    FRESHWATER = "Fresh Water",

    /** Cold land terrains */

    POLAR = "Polar terrain", 
    TUNDRA = "Tundra",
    TAIGA = "Taiga",
    COLD_DESERT = "Cold Desert",

    /** Middling temperature land terrains */

    STEPPE = "Steppe",
    GRASSLAND = "Grassland",
    TEMPERATE_FOREST = "Temperate Forest",
    TEMPERATE_SWAMP = "Temperate Swamp",

    /** Hot land terrains */

    HOT_DESERT = "Hot Desert",
    TROPICAL_GRASSLAND = "Tropical Grassland",
    TROPICAL_FOREST = "Tropical Forest",
    TROPICAL_SWAMP = "Tropical Swamp"

}