We're cribbing from SimEarth here. This story contains the following tasks:

* Create logic to show and hide dialogs on top of the game world as needed.
    * This is one of the reasons we're using Svelte. Having some sort of UX framework running alongside Phaser allows me to use my web programming knowledge for setting up a user interface.
* Create a toolbar component - buttons for interacting with the world live here.
* Add the first tool - the ability to change the terrain of a tile. Don't be surprised if this gets split off into a seperate ticket, because it presupposes at least the following and probably more:
    * We need to capture mouse input...
    * Determine what exactly the user is clicking on (for now, just a **Tile** in the user's **World**)...
    * Update the data in the correct **Tile** object...
    * Ensure that things update correctly on the rendering side of the app! (...which isn't automatically dependent on PP-2, but I suspect it might be.)
    