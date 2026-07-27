This (and future PP-4 subtickets) is part of a series of tickets to move us away from the earliest testing code for world generation and towards something we can actually use to create a playable **World**. The end goal here is to to generate terrain that looks like an actual landmass; I expect the majority of the changes here to end up either in `World.populateWorld()`, or new subfunctions. For this ticket, we should do the following:

* Begin by generating a heightmap. Perlin noise is a good starting point for this, though there are still some unanswered questions about how to tweak it for the best results. (Update: As of 7/14/2026, we're now using the `simplex-noise` library off NPM for noise generation.)
    * As a note - we're going to be doing a lot of repeated calculations on 2D arrays. Since this is established mathematics, we should investigate methods and libraries we can use to make this easier on ourselves, and more readable to boot.
    * Tile height needs to be clamped based on the `DEFAULT_MAXIMUM_ALTITUDE` we defined earlier, and should usually remain close to `DEFAULT_SEA_LEVEL`.
* Next up - create a heatmap! The earliest iteration of this should set a **Tile**'s `temperature` based on its distance from the equator and height relative to `DEFAULT_SEA_LEVEL`.
    * There is a _ton_ of room for future implementation work, but this is a good MVP. In the long run, though, I expect a lot of systems to care about temperature.
* Once we have these values, use them to determine the **TerrainType** for each **Tile** in the player's **World**.
    * This in particular needs to be a well isolated function, since we'll want to run this regularly.
* For testing purposes, we may want to adjust the temperature and height of tiles regularly in the simulation loop, but this could also be spun off into a separate ticket.

Update (7/14/2026): When it comes to world generation and simulation, I expect to implement a large number of functions where we need to account for not only the current state of a **Tile**, but also some number of **Tiles** around it (essentially, effects propagating throughout the player's **World**). It could save us a lot of labor (and probably help with code intelligibility) to use a pre-existing library for math, and in particular matrix/multi-dimensional array work. This needs research. Something like https://www.npmjs.com/package/mathjs could do the trick.

Update (7/22/2026): Dynamic updates to temperature and climate simulations have been spun off into PP-4-2.
