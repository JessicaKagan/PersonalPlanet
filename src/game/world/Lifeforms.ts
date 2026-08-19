import { LifeFormSize, LifeFormType, type FoodPreference } from "../defines/lifeforms";
import type { LifeformsInTile } from "./Tile";

/** Represents a type of living being that can appear in a player's World. */
export interface Lifeform {
    // FUTURE: When we start showing Lifeform information to players in the UI,
    // we should add some name-related properties for prettyprinting. For example,
    // we could include the preferred plural form of a Lifeform's name.
    name: string;
    size: LifeFormSize;

    /** 
     * @warning As of 08/11/2026, lifeforms can have a default sprite, but only should if they're eligible to be Characters.
     * Otherwise, this field should explicitly be null.
     */
    spriteKey: string | null;
    
    preferredTemperature: number;
    preferredHumidity: number;

    // FUTURE: How many purely aquatic lifeforms are going to care about humidity?
    // In addition - how do we handle amphibious life?
    isAquatic: boolean;

    // Hardiness represents how well a lifeform tolerates a non-ideal climate.
    // The default for each of these is 1. Use smaller values for especially picky or delicate species, and larger for more adaptable ones.
    temperatureHardinessFactor: number;
    humidityHardinessFactor: number;
    diet: FoodPreference[];
    type: LifeFormType;
}

/** Adjust the frequency with which a Lifeform is used as the base for a randomly generated Character.
 * As of 08/11/2026, most characters should be medium or large, with a few small or huge outliers.
 */
export function getLifeformSizeWeightForCharacter(size: LifeFormSize) {
    switch (size) {
        case LifeFormSize.Microscopic:
            return 0;
        case LifeFormSize.Tiny:
            return 0;
        case LifeFormSize.Small:
            return 1;
        case LifeFormSize.Medium:
            return 32;
        case LifeFormSize.Large:
            return 64;
        case LifeFormSize.Huge:
            return 8;
    }
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

/** Compute whether a type of Lifeform has the right combination of properties to be a Character in the player's WOrld. */
export function isLifeformValidCharacter(lifeform: Lifeform): boolean {
    // As of 08/11/2026, lifeforms need to be Small or larger and have a spriteKey defined in order to be valid targets for Character generation, 
    // but this will change over time. 
    if (!lifeform.spriteKey) {
        return false;
    }

    if (lifeform.size === LifeFormSize.Microscopic || lifeform.size === LifeFormSize.Tiny) {
        return false;
    } else {
        return true;
    }
}