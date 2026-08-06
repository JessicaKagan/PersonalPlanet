import type { LifeformsInTile } from "./Tile";

/** Represents a type of living being that can appear in a player's World. */
export interface Lifeform {
    // FUTURE: When we start showing Lifeform information to players in the UI,
    // we should add some name-related properties for prettyprinting. For example,
    // we could include the preferred plural form of a Lifeform's name.
    name: string;
    size: LifeFormSize;
    
    preferredTemperature: number;
    preferredHumidity: number;

    // FUTURE: How many purely aquatic lifeforms are going to care about humidity?
    // In addition - how do we handle amphibious life?
    isAquatic: boolean;

    // Hardiness represents how well a lifeform tolerates a non-ideal climate.
    // The default for each of these is 1. Use smaller values for especially picky or delicate species, and larger for more adaptable ones.
    temperatureHardinessFactor: number;
    humidityHardinessFactor: number;
}

/** General size categories for Lifeforms. These are intentionally left vague.
* As of 07/29/2026, these will be used primarily for estimating the carrying capacity of a Tile.
*/
export enum LifeFormSize {
    /** Invisible to the naked eye. Bacteria, algae, plankton. */
    Microscopic,
    /** The smallest things humans can see. Grass, some types of fungi, insects. */
    Tiny,
    /** Anything larger than an insect or blade of grass, up to perhaps the size of common pets like cats, dogs, rabbits, etc for animals, flowers and shrubs for plants, etc. */
    Small,
    /** Life forms at approximately a human scale. Humans count! */
    Medium,
    /** Life forms that are appreciably larger than humans, up to an order of magnitude tops. Big mammals and reptiles, trees, etc. */
    Large,
    /** The largest life forms. Probably starting at megafauna like whales and elephants. Pando would feel right at home here. */
    Huge
}

/** Adjust how many of a specific lifeform are generated based on their size.
 * This method mirrors getSizeMultiplierForBiomass().
 */
export function getSizeMultiplierForInitialLifeformCount(size: LifeFormSize) {
    switch (size) {
        case LifeFormSize.Microscopic:
            return Math.pow(2, 20); // 1,048,576
        case LifeFormSize.Tiny:
            return Math.pow(2, 12); // 4,096
        case LifeFormSize.Small:
            return Math.pow(2, 6); // 64
        case LifeFormSize.Medium:
            return 16;
        case LifeFormSize.Large:
            return 4;
        case LifeFormSize.Huge:
            return 1;
    }
}

/** When calculating the overall biomass of a tile (for PP-5-2), ensure that larger lifeforms count for substantially more.
 * This method getSizeMultiplierForInitialLifeformCount().
 */
export function getSizeMultiplierForBiomass(size: LifeFormSize) {
    switch (size) {
        case LifeFormSize.Microscopic:
            return 1;
        case LifeFormSize.Tiny:
            return 4;
        case LifeFormSize.Small:
            return 16;
        case LifeFormSize.Medium:
            return Math.pow(2, 6); // 64
        case LifeFormSize.Large:
            return Math.pow(2, 12); // 4,096
        case LifeFormSize.Huge:
            return Math.pow(2, 20); // 1,048,576
    }
}

/** Compute the overall biomass of a tile's lifeforms, as a weighted sum. */
export function getBiomassForTile(lifeForms: LifeformsInTile[]): number {
    if (lifeForms.length > 0) {
        return lifeForms
            .map(lifeForm => lifeForm.count * getSizeMultiplierForBiomass(lifeForm.type.size))
            .reduce((previousValue, currentValue) => previousValue + currentValue);
    }

    return 0;
}