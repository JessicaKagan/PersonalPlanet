/** Represents a type of living being that can appear in a player's World. */
export interface Lifeform {
    // FUTURE: When we start showing Lifeform information to players in the UI,
    // we should add some name-related properties for prettyprinting. For example,
    // we could include the preferred plural form of a Lifeform's name.
    name: string;
    size: LifeFormSize;
    preferredTemperature: number;
    
    // FUTURE: How many purely aquatic lifeforms are going to care about humidity?
    // In addition - how do we handle amphibious life?
    preferredHumidity: number;
    isAquatic: boolean;

    // FUTURE: We should implement some values representing a lifeform's tolerance of different climates - hardiness factors
    // for humidity and temperature, to begin with.
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