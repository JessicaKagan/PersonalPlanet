This ticket introduces a core feature for Personal Planet - the ability to display and keep track of notable characters in the world. A **Character** in Personal Planet is an autonomous agent that exists in the player's **World**. They have an explicitly defined appearance, goals, and abilities to use for achieving those goals.

The initial implementation of **Characters** will be used to display **Lifeforms** in the player's world. Their behavior will be very simple at first, since they're primarily present to make the **World** _look_ more lively. At a high level, we need to do the following:

* Define the **Character** class, and update `src\game\scenes\Game.ts` to keep track of the current characters in the user's **World**. Some key properties for the first iteration: 
    * Unique ID
    * Name
    * Species
    * Current location
    * The time when the **Character** was added to the **World*
    * Protected status (can this **Character** be purged to save resources?)
    * Allowed behaviors and their time costs (i.e, how often can the character attempt to move?).
    * In future iterations, we'll want to track **Character** goals, distinguish between intelligent and non-intelligent **Lifeforms**, and continue to build out behaviors by tracking a **Character**'s personality, goals, etc.
* Update the simulation loop to create, update, and destroy **Characters** as appropriate.
    * Characters will be the most active part of the **World**. They won't necessarily perform actions every simulation tick, but **Character** update ticks should still happen much more frequently than other world updates.
    * We're fundamentally coming up with a way to define **Character** AI and create complex behavior by combining multiple (relatively) simple actions. There'll be some randomness here, but long term **Characters** will choose behaviors based on their personalities, goals, and the state of the world around them.
* Update the rendering loop to display **Characters** in the world.
    * We will use Phaser's **Sprite** system. While I don't intend to include animations for **Sprites** at this time, we still want to be able to animate them (tweens, masks, etc).
    * I intend to allow multiple **Characters** to occupy the same tile, though how many we should allow (and how many we should attempt to display, much less how to handle displaying them) is up in the air at this time.

Known questions:
* How many **Characters** should we keep track of at any given time? I wouldn't be surprised if this ended up being in the hundreds or thousands.
* When should **Characters** be created and destroyed? Users will be able to override this to some extent in the long run. In general, we need to be able to determine how important a **Character** is to the user's **World**.
* How often should the **Character** simulation ticks run? I'd prefer for them to run very frequently - when combined with the ability to make behaviors cost varying amounts of time, this should allow us a decent level of precision when determining how quickly **Characters** act in the world.