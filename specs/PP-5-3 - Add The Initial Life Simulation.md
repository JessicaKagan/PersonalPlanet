This is a subset of PP-5. In recent tickets, we've added basic logic for creating an initial batch of **Lifeforms** for the player's world, created an overlay for **Tile** biomass, and prototyped the **Character** layer for showing notable **Lifeforms** in the user's world. Outside of the initial implementation, the big theme here has been _visualizing_ life. Now that we have some features for that, we can start implementing the loop for updating lifeforms. This will most likely live in `World.updateLifeforms()` and its associated subfunctions.

## Key Behaviors
* Life should be able to spread throughout the world over time.
* Specific **Lifeforms** should be most common in **Tiles** with a suitable climate and a controlled amount of predators, but should be able to eke out at least a marginal living outside their preferred biome.
* A **Tile** shouldn't have a strictly defined carrying capacity for biomass. If a **Lifeform** has sufficient resources, its populate should grow over time.
* We want to avoid cases where life counts in the world completely collapse or skyrocket out of control.
* As a corollary, though, sudden diebacks and local extinctions are fine, to a point. For instance, if too many predators eat all the food in an area, they should die, migrate elsewhere, etc.

## Tasks
The **Lifeform** interface needs new properties in order to allow for predation in the first place. We'll add a `diet` property representing the ways in which each type of **Lifeform** can nourish itself, plus its relative preferences. This allows **Lifeforms** to feed on as narrow or diverse of a diet as developers see fit.

```
diet: FoodPreference[];

export interface FoodPreference {
    behavior: FoodBehavior;
    weight: number;
}

export enum FoodBehavior {
    PHOTOSYNTHESIS,
    HERBIVORE,
    CARNIVORE,
    ...
}

```

To support the initial testing lifeforms, we'll also need to disambiguate **Lifeform** types.

```
type: LifeFormType;

export enum LifeFormType {
    PLANT,
    ANIMAL,
    MICROSCOPIC,
    ...
}
```

**Lifeforms** will also need a property to indicate how quickly they reproduce on average, before we factor in overall fitness and success in feeding themselves. We'll want to populate this with a default value.
```
reproductionRate = 1.02; // By default, a lifeform will increase its population by 2% each cycle assuming no predation, average food access, and perfect habitability.
```

We need to define a behavior loop for **Lifeforms**, which will happen during each life update tick in the simulation. **Lifeforms** will often act in a way that potentially clashes with other **Lifeforms**, so in order to have consistent results, we need to simulate some behaviors concurrently.
* Before we can actually run **Lifeform** behaviors, we need to compute a "fitness" score for each type of life in the tile. We'll want to add a method for computing how successfully a type of **Lifeform** can live in the tile; this will return a `fitnessScore`. `World.populateInitialTileLife()` contains some logic for computing a `climateMismatchReductionFactor`, so we can use that as an initial baseline.
* First, **Lifeforms** in a tile will attempt to find food. For now **Lifeforms** will either attempt to prey on other life, or photosynthesize.
    * For photosynthesis (or really, any method of gaining food other than attacking other **Lifeforms**), we'll compute the amount of food gained based solely on the `fitnessScore`.
    * For predation, we'll represent predation attempts within a tile as "attacks" on other lifeforms. The amount of attacks will depend on the **Lifeform**s' number and size. We'll use a weighted average based on the relevant `FoodPreferences` to choose which other **Lifeforms** are targeted.
    * Once we have our "attacks" defined, the **Lifeforms** chosen for predation will attempt to defend themselves. For now, this will depend mostly on the **Lifeforms**' size, and to a lesser extent, the `fitnessScore`. If attacks > defense, some of the defenders will die, and the attackers will gain some food.
* Next, we'll compare the food the **Lifeforms** in a tile were able to acquire to how much they need after any predation losses to get a `feedingScore`. A surplus will slightly increase their reproduction rate for this tick, but a shortage will significantly reduce it. If feeding was _especially_ unsuccessful, the creatures' numbers will plummet!
* We'll use the `feedingScore` and `fitnessScore` to compute the reproduction rate for the **Lifeforms** in the tile, and multiply that by the amount that's currently in the tile.
* Finally, some **Lifeforms** in the tile will migrate to neighboring tiles. For this first iteration, we'll assume animals have a "baseline" ability to migrate (1), and plants have a very low but no-zero ability to migrate (0.01). We'll choose a small percentage of them, multiplied by the aforementioned migration ability, and send them to a nearby eligible tile. This will be one tile away 90% of the time, two tiles away 9% of the time, and three 1% of the time; there's no significance to the specific values other than that they're relatively round for testing.

## Future Plans
The proposed life simulation assumes that successful predation necessarily *kills* a **Lifeform**. There's a variety of feeding strategies that don't do this, though (for instance, animals that eat fruit, seeds, nectar, decaying matter, etc). How can we represent this? We could continue to use a naive attack/defense approach for these feeding styles, perhaps with significantly reduced mortality. However, a more nuanced approach would be to add a "food resources" property to certain types of lifeforms, indicating how much in the way of specific types of food they can freely offer before any further effort to feed on them is treated as an attack. These two methods aren't mutually exclusive and will definitely need more time in the oven.

In the further future, the life in a tile will affect the climate situation. Lots of photosynthesizing plants could result in local albedo reductions (meaning more insolation is absorbed), but also in carbon fixation and other atmospheric changes (potentially meaning the world cools more).