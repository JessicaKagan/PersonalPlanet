# What is Personal Planet?
Personal Planet is an incremental game loosely inspired by Maxis' old "software toys" - simulations with an emphasis on discovery and experimentation over tightly controlled gameplay; an emphasis on *intrinsic* vs extrinsic motivation.

Key inspirations - SimEarth, Civilization, PDS games, etc. Take charge of a planet and see how its inhabitants adapt to changing conditions... or don't.

Big questions at this time: 
* How much do we want to go into simulating a planet? How much do we want to go into simulating the life forms? Civilizations? Working on one layer doesn't necessarily prevent us from working others in the future. We need to keep each layer as functionally separate as possible, at least in the sense that any communication between them is intentional. Separation of concerns.
* How do we store data? This is a single player game with some persistence. We'll need to be able to save and restore users' sessions. File system access, eventually, especially when we autosave.
* How much do we care about realism? My understanding is that it's not the top priority. Some attention is important, but we want to prioritize *intuitive* and *interesting* behavior. The sort of thing that opens up gameplay options. Example: If you have a civilization that's polluting a lot in an area, it should hurt the biodiversity of the area, food production, life expectancies, and potentially (depending on the civilization's overall mindset) happiness. Do you want to get them to stop polluting by changing their focuses or perhaps developing clean tech? Or do you want to see what happens if it gets worse? Rebellions? Die-backs?

What sort of components need to be built out? Order not guaranteed yet.
1. The simplest way to represent a planet is as a rectangle. A two-dimensional array of tiles. We need a Tile object that can contain various types of data:
    * Terrain (biomes, special features)
    * Non-sentient life (what lives in the tile?)
    * Sentient life (which can belong to a civilization)
    * Possibly civilization leaders? Important figures in a civilization, like a general leading an army, or a politician, or a famous artist.
2. Handling various layers of gameplay loops independently. We need to distinguish between running the underlying simulation and our renderer (which is presumably whatever Phaser gives us. More study is required.)
    * I expect much of this to be synchronous, to the point that we need to compute the actions of various agents in the simulation and resolve conflicts before we can declare a tick ready and move onto the next one.
3. We need to design our interface for interacting with the simulation. What kind of actions are particularly important?
    * Adjusting simulation rules (like the high level properties of your planet)
    * Editing your planet at a micro/tile level (paint/image editing tools?)
    * Adjusting agent behavior (like a civilization or a leader).

What can I study to prepare for this project?
* Building simulations. I have a sense of the basics, but learning more about the design process, particularly around having multiple layers of simulation interact.
* More specific to any planet/life based layers - what are some mathematical models and techniques we can use to represent simulation processes in Personal Planet? How would we implement them? There's probably libraries to help with specific types of math.
* Game AI - There's potentially a vast number of agents in the world we're simulating, so we want to make sure we're not getting bogged down in complex rules. In general, the agents don't need to be very smart, but they should be able to choose strategies and work towards them, even if it's simply by weighting. Rules based systems? Some randomness.
