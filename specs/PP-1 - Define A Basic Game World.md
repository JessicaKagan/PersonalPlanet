For want of a better starting point - the player's **World** is a multidimensional array of **Tiles**. The simulation should be able to act on individual **Tiles**, batches of them, or perhaps even all of them at once.

This story, at a minimum, should include the following subtasks:
* Define a minimum array of **Tiles**.
    * Longer term, we want to support bigger worlds with more **Tiles**. But to begin with, we probably want something small.
    * A future ticket will add camera controls of some sort (built off Phaser's controls), so we can move around a larger world.
* Include some sort of minimal object we can render. Call it **Terrain**.
    * We'll need a default size in Phaser's game world.
* Set up Phaser so that it renders the tiles.

TODO: Should we include settings in **World** objects? We probably want a separate interface for them, but do we want an even higher level reference to the user's game above their game world?

