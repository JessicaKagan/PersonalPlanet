import { type Lifeform } from "../world/Lifeforms";

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

/** Broad categories of lifeforms.
 * @future When we start adding more lifeforms, we should investigate whether it's better for our purposes to
 * base lifeform types on specific varieties of life that exist (or potentially could exist), or for these to be based on ecological niches
 * and behavior et al. The latter is simpler. I'm not sure which works better for nuanced behavior.
 * If we go with the niche based approach, we should investigate allowing lifeforms to have multiple types.
 * Case #1: A bunch of herbivores probably wouldn't mind chowing down on mushrooms, but wouldn't really be down for slime molds.
 */
export enum LifeFormType {
    PLANT,
    ANIMAL,
    FUNGI
}

export interface FoodPreference {
    behavior: FoodBehavior;
    weight: number;
}

/** Dietary options for Lifeforms. */
export enum FoodBehavior {
    /** Able to turn sunlight and CO2 into energy. */
    PHOTOSYNTHESIS,
    /** Able to eat plant and plant-like lifeforms. */
    HERBIVORE,
    /** Able to eat animal and animal-like lifeforms. */
    CARNIVORE,
    /** Able to eat microscopic lifeforms. */
    FILTER_FEEDER
}

/**
 * As of 8/19/2026, our testing life forms represent two (extremely simplified) food chains (though the name changes in 08/11/2026 make things far more absurd).
 * First, we have a land chain (grass photosynthesizes, and is eaten by yaks, which are hunted by wolves).
 * Second, we have an ocean chain (plankton photosynthesizes, and is eaten by both goldfish and kraken. Goldfish also eat kelp. Sharks hunt kraken and goldfish.)
 * There's a few assumptions built in - size should be no guarantee of predation patterns, and the best opportunities for food aren't always in the most
 * hospitalable climates.
 */
export const DEFAULT_LIFEFORMS: Lifeform[] = [
    {
        name: "grass",
        size: LifeFormSize.Tiny,
        spriteKey: null,
        preferredTemperature: 293,
        preferredHumidity: 50,
        isAquatic: false,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 2,
        diet: [
            {
                behavior: FoodBehavior.PHOTOSYNTHESIS,
                weight: 1
            }
        ],
        type: LifeFormType.PLANT
    },
    {
        name: "yak",
        size: LifeFormSize.Large,
        spriteKey: "yak",
        preferredTemperature: 293,
        preferredHumidity: 50,
        isAquatic: false,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1,
        diet: [
            {
                behavior: FoodBehavior.HERBIVORE,
                weight: 1
            }
        ],
        type: LifeFormType.ANIMAL
    },
    {
        name: "wolf",
        size: LifeFormSize.Medium,
        spriteKey: "wolf",
        preferredTemperature: 293,
        preferredHumidity: 75,
        isAquatic: false,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1,
        diet: [
            {
                behavior: FoodBehavior.CARNIVORE,
                weight: 1
            }
        ],
        type: LifeFormType.ANIMAL
    },
    {
        name: "plankton",
        size: LifeFormSize.Microscopic,
        spriteKey: null,
        preferredTemperature: 303,
        preferredHumidity: 50,
        isAquatic: true,
        temperatureHardinessFactor: 4,
        humidityHardinessFactor: 1,
        diet: [
            {
                behavior: FoodBehavior.PHOTOSYNTHESIS,
                weight: 1
            }
        ],
        type: LifeFormType.ANIMAL // I know they're not ALL animals, but for now...
    },
    {
        name: "kelp",
        size: LifeFormSize.Tiny,
        spriteKey: null,
        preferredTemperature: 303,
        preferredHumidity: 50,
        isAquatic: true,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 2,
        diet: [
            {
                behavior: FoodBehavior.PHOTOSYNTHESIS,
                weight: 1
            }
        ],
        type: LifeFormType.PLANT
    },
    {
        name: "goldfish",
        size: LifeFormSize.Small,
        spriteKey: 'goldfish',
        preferredTemperature: 283,
        preferredHumidity: 50,
        isAquatic: true,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1,
        diet: [
            {
                behavior: FoodBehavior.HERBIVORE,
                weight: 1
            },
            {
                behavior: FoodBehavior.FILTER_FEEDER,
                weight: 0.2
            }
        ],
        type: LifeFormType.ANIMAL
    },
    {
        name: "shark",
        size: LifeFormSize.Large,
        spriteKey: 'shark',
        preferredTemperature: 283,
        preferredHumidity: 50,
        isAquatic: true,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1,
        diet: [
            {
                behavior: FoodBehavior.CARNIVORE,
                weight: 1
            }
        ],
        type: LifeFormType.ANIMAL
    },
    {
        name: "kraken",
        size: LifeFormSize.Huge,
        spriteKey: 'kraken',
        preferredTemperature: 278,
        preferredHumidity: 50,
        isAquatic: true,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1,
        diet: [
            {
                behavior: FoodBehavior.FILTER_FEEDER,
                weight: 1
            },
            {
                behavior: FoodBehavior.CARNIVORE,
                weight: 0.1
            }
        ],
        type: LifeFormType.ANIMAL
    },
]