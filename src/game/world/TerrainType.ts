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

    /** The land equivalent of an ice cap. The average monthly temperature never exceeds 0°C.  */
    POLAR = "Polar terrain", 

    /** The driest cold non-polar terrain. */
    COLD_DESERT = "Cold Desert",
    /** Tundras vary a lot, but for now are treated as moderately dry cold terrain. */
    TUNDRA = "Tundra",
    /** Taigas (aka boreal forests) vary a lot too, but for now are treated as less dry cold terrain. */
    TAIGA = "Taiga",

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