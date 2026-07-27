This is a brainstorming ticket. A few requirements we know about:
* The player's world is heated by a source (presumably a sun).
* The player's world absorbs some of the heat, but reflects some of it (depending on albedo), and radiates some more. This means there's a maximum amount of hot the overall system gets.
* The player's world contains X amount of water, mostly in water terrain tiles. It should, to some extent, evaporate and spread through the world.
* The type of terrain you see in a tile depends on how much heat and water it gets.

Known requirements:
* We need to expand the **Tile** to store additional information about climate and weather condition. In particular, if we allow tiles to change based on the state of the world, updates to these properties will need to (potentially) result in tile type changes.
* We need to come up with some set of functions for simulating aspects of the world as a whole. TODO: As part of the spec work, we need to flesh this out further!
* We need to update the game loop so that each tile can be regularly updated based on the results of the world simulation. `World.updateAllTiles()` might come in handy here!
* In the interest of interactivity, climate simulations et al shouldn't be too volatile by default. Changing the simulation speed ties into that, but the overall feel of the world shouldn't change drastically unless you're running the simulation at an especially high speed.

This is a part where researching the various climate models/simulations out there might be handy, though a lot of them would probably be too rigorous for this game.