This is the first of what will most likely be several tickets for allowing users to view information about their **World** and **Tiles**' lifeforms. More generally - biodiversity information. There's a few layers to this (pun possibly intended):

* First, we will update the **World** controls toolbar with a button to enable the life overlay.
    * Overlays are related to **World** control tools, but aren't really the same. We'll need to keep track of which view mode the user has enabled at any given time in the **Game** scene.
    * In the future, we might want to move the viewmode controls out of the **World** controls and into a new toolbar, but keeping them in the controls in the short term helps us get to a point where we can iterate and test quicker.
    * Should the default view have its own button as well, or should users get to it by exiting out of any other views they're displaying? I currently lean towards having the button for the default view, with the understanding that in a future ticket, we can allow players to exit out of a specialized view with a hotkey or similar.
* Next, we'll update the logic for rendering the **World** to include a life overlay for each **Tile**.
    * This is something we'll need to update over time, as we add more complexity to the life feature.
    * For this iteration, we'll stick to measuring the overall biomass of each tile. This will be a simple count of the number of **Lifeforms** in the tile, but larger lifeforms will count for significantly more.
    * As a corollary, we should compute and store the total lifeform count for each tile whenever we update the life layer of the simulation.
    * Biomass will be represented with a transulcent overlay on top of the tile in this mode. Phaser has a graphics feature that allows us to draw primitives. We'll use that to render a rectangle on top of each **Tile** in the world. The tile with the most life in it gets a 50% opacity green fill, a tile that's completely devoid of life would get a 0% opacity fill, and everything else will be somewhere in between.
* Finally, we'll update the **Query** tool to display some information about biomass for the **Tile** the user is tracking. This could reasonably be split off into a separate ticket.
    * In the **Query** tool's detailed mode, we should always display a list of lifeforms sorted by size-weighted count, regardless of the current overlay.
    * In hover mode, we should display the list instead of the climate information if the user is viewing the lifeform overlay.
    * These definitionally means that the query tool needs to keep track of overlay changes.
    * By default, we should truncate to the most prominent lifeforms in the tile, with the option to extend the display by clicking an "expand" button (...and probably a "contract" button too?) This should be more aggressive in hover mode than in detailed mode.