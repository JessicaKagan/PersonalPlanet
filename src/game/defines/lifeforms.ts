import { LifeFormSize, type Lifeform } from "../world/Lifeforms";

/**
 * As of 7/29/2026, our testing life forms represent two (extremely simplified) food chains (though the name changes in 08/11/2026 make things far more absurd).
 * First, we have a land chain (grass photosynthesizes, and is eaten by yaks, which are hunted by wolves).
 * Second, we have an ocean chain (plankton photosynthesizes, and is eaten by both goldfish and kraken. Sharks hunt kraken and ignore herring).
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
        humidityHardinessFactor: 2
    },
    {
        name: "yak",
        size: LifeFormSize.Large,
        spriteKey: "yak",
        preferredTemperature: 293,
        preferredHumidity: 50,
        isAquatic: false,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1
    },
    {
        name: "wolf",
        size: LifeFormSize.Medium,
        spriteKey: "wolf",
        preferredTemperature: 293,
        preferredHumidity: 75,
        isAquatic: false,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1
    },
    {
        name: "plankton",
        size: LifeFormSize.Microscopic,
        spriteKey: null,
        preferredTemperature: 303,
        preferredHumidity: 50,
        isAquatic: true,
        temperatureHardinessFactor: 4,
        humidityHardinessFactor: 1
    },
    {
        name: "goldfish",
        size: LifeFormSize.Small,
        spriteKey: 'goldfish',
        preferredTemperature: 283,
        preferredHumidity: 50,
        isAquatic: true,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1
    },
    {
        name: "shark",
        size: LifeFormSize.Large,
        spriteKey: 'shark',
        preferredTemperature: 283,
        preferredHumidity: 50,
        isAquatic: true,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1
    },
    {
        name: "kraken",
        size: LifeFormSize.Huge,
        spriteKey: 'kraken',
        preferredTemperature: 278,
        preferredHumidity: 50,
        isAquatic: true,
        temperatureHardinessFactor: 1,
        humidityHardinessFactor: 1
    },
]