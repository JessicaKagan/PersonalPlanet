This is the first part of PP-5, where we add **Lifeforms** to the player's world. This approximately corresponds to the first two tasks from that ticket.

First, we create a **Lifeform** interface. Each **Lifeform** represents a living being that can appear in a user's world. At a minimum, we'll include the following properties:
* Name (string)
* Size (either an enum where we can choose between predefined sizes, or perhaps a number, Dwarf Fortress style)
* Preferred temperature (number)
* Preferred humidity (number between 0-100)
* An "aquatic" flag (boolean) for sea life, and potentially for lake/river life at some point.

Properties I plan in the future, but which I don't expect to make it into the first iteration:
* Diet - it's essential for making different types of life interact, but how do we represent this in a sufficiently nuanced way? The exact nature of predation in _Personal Planet_ needs some serious thought for even a first draft. Types of food and preferences come to mind.
* Reproduction rate - in ideal conditions, how quickly can this species increase its numbers?
* Appearance (likely a Phaser spritesheet) - this isn't going to be present for a long time, but we'll need to account for what appearance a lifeform can have once we start showing them to the user.

To test the **Lifeform** interface, we should create a list of lifeforms for testing - basically a JSON list. How do we want to implement this, though?
* In the very short term, we should be able to test successfully with 3-4 simple lifeforms defined in `src\game\defines.ts`.
* In the long run, I'd like to open up Personal Planet for non-coders to modify game settings to some extent. This is yet another _Dwarf Fortress_ inspired feature; see the RAW modding you can do in that game. This has the potential to balloon the ticket scope if we try to implement it too early, but it also feels like it'd be handy early on. Right now, I'm inclined to split this off into a more general "Load defines at runtime" story.

Finally, we need to implement an initial `life` property in the **Tile** class. This is going to be an array of types of **Lifeforms** in the tile, along with some metadata about how many are present. As part of this, we'll add a method to populate the user's **World** with some initial lifeforms.

For debugging purposes et al, we'll eventually need to display lifeforms in the query tool, but there's enough complexity here that we'll want to separate this into another ticket.