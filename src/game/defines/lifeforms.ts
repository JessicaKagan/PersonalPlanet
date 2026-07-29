import { LifeFormSize, type Lifeform } from "../world/Lifeforms";

/**
 * As of 7/29/2026, our testing life forms represent two (extremely simplified) food chains.
 * First, we have a land chain (grass photosynthesizes, and is eaten by cows, which are hunted by wolves).
 * Second, we have an ocean chain (plankton photosynthesizes, and is eaten by both herring and whales. Sharks hunt whales and ignore herring).
 * There's a few assumptions built in - size should be no guarantee of predation patterns, and the best opportunities for food aren't always in the most
 * hospitalable climates.
 */
export const DEFAULT_LIFEFORMS: Lifeform[] = [
    {
        name: "grass",
        size: LifeFormSize.Tiny,
        preferredTemperature: 293,
        preferredHumidity: 50,
        isAquatic: false
    },
    {
        name: "cow",
        size: LifeFormSize.Large,
        preferredTemperature: 293,
        preferredHumidity: 50,
        isAquatic: false
    },
    {
        name: "wolf",
        size: LifeFormSize.Medium,
        preferredTemperature: 293,
        preferredHumidity: 75,
        isAquatic: false
    },
    {
        name: "plankton",
        size: LifeFormSize.Microscopic,
        preferredTemperature: 303,
        preferredHumidity: 50,
        isAquatic: true
    },
    {
        name: "herring",
        size: LifeFormSize.Small,
        preferredTemperature: 283,
        preferredHumidity: 50,
        isAquatic: true
    },
    {
        name: "shark",
        size: LifeFormSize.Large,
        preferredTemperature: 283,
        preferredHumidity: 50,
        isAquatic: true
    },
    {
        name: "whale",
        size: LifeFormSize.Huge,
        preferredTemperature: 278,
        preferredHumidity: 50,
        isAquatic: true
    },
]