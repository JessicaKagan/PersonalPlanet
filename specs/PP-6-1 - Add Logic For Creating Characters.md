This subticket corresponds to the first task in PP-6, as well as part of the second.

The current draft of a schema for a **Character** looks like this:
```
{
    private readonly id: string;
    public readonly timeCreated: number; 

    public name: string;
    public species: Lifeform;
    public spriteKey: string;
    public isProtected: boolean;

    public x?: number;
    public y?: number;

    private allowedBehaviors = []; // NOTE: This is incomplete and provided only for reference.
}
```

How we model the behaviors of a **Characters** is still very undefined, outside of knowing that we want **Characters** to select from a list of behaviors each simulation tick.

The main purpose of this spec is actually to document the requirements for initial character creation. **Characters** are associated with the player's **World**, and the initial batch of them will be created on worldgen using the `populateInitialCharacters()` method. This has two major requirements:

1. In the interest of reusing code, we need a reusable method for creating **Characters**. For all intents and purposes, this is the constructor logic. The **Character** class is closely associated with a `CharacterConstructorArgs` interface, which allows us to programmatically and tersely handle all of the potential options for character generation. Over time, we'll add most new **Character** properties, but many of them will be optional, depending on what sort of **Character**'s being created for the world. I also plan to add methods for programmatically altering character properties, at least where it makes sense to have stricter verification and possible side effects.
2.  To generate the initial character list, we need to do the following:
    1. Determine what kinds of beings are eligible for being characters. This is most likely a task of extending the Lifeform interface. Later on, most characters will be sentient beings, but for now, any lifeform above small size should be eligible to be a character, with a bias towards larger lifeforms.
    2. Run a loop to generate characters. For this, we need a "create valid character" method (probably in src\game\characters\Character.ts) that we iterate through until the length of this.characters == INITIAL_CHARACTER_COUNT_FOR_WORLDGEN.
        * First, we select a tile and eligible species for character generation. The tile should be random and probably shouldn't have a character already in it.
        * Then we choose from the lifeforms present in that tile and create a Character object using these properties. This will be a weighted random value, initially using size as the primary weighting factor, but potentially additional ones over time.