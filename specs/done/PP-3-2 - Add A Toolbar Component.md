This is a subset of PP-3. In this ticket, we'll be building out the user interface in this app, using the Svelte side of the project. I currently expect to use Svelte to build out most of the user interface, while using Phaser to handle the simulation, graphics, and audio. To do this, we'll need to do the following:

* Create logic to show and hide dialogs on top of the game world as needed.
    * This is going to be a Svelte component. We'll use the HTML dialog component as a base (thanks, semantics!) and Svelte itself to dynamically add relevant controls.
    * Specific dialogs will be separate components that inherit from the core dialog.
* Create the toolbar component itself - a dialog with a palette of tools (selectable by button) for interacting with the world. This is a core feature that will see frequent development as we add more to the simulation.
    * This component is similar to something you'd find in a paint program or photo editor.
* Add a testing feature to the toolbar. This will most likely be the MVP for a "query" tool.
    * The primary purpose of this is to test the Phaser/Svelte integration and provide a baseline for further toolbar components.
    * A query tool in particular will ensure that we can send UX state information to Phaser, run relevant game logic, and then send that information to the UX layer.

More details on the query tool MVP (added as of 6/25/2026):
* There are two modes of querying, and they're not mutually exclusive. When the query tool is active, users can either query a tile by hovering over it with their mouse, or they can click to lock to viewing a specific tile. In both cases, we should show a dialog that displays information about the relevant tile.
    * The dialog component will be shared between each mode.
    * There are a bunch of known unknowns about what happens if we add, for instance, agents that can move around the game world independently. In the long run, should these be implemented, we should find a way to track them even when they move away from the tile the user has queried. I'd like this to be as seamless as possible.
* When the user is query-hovering, the dialog should follow the user's cursor, and should display only summary information.
    * In this mode, the dialog's position should be clamped based on the user's viewport.
    * While it isn't necessary for a querying MVP, we do need to eventually figure out what to do if the user wants to query a tile that's _underneath_ a UX element.
* When the user clicks a tile with the query tool active, we should stick the dialog in a fixed area (tentatively to the right of the game graphics) and display detailed information about the tile. Doing so should also turn off the query tool.
    * We should render additional controls for the dialog in this case, such as a button to close the dialog, and a way to pan the camera to the queried tile.
    * Is it possible to show the tile contents in the dialog? We could render tiles as background images, but if we add more features, this won't be enough. The ideal solution, from my perspective, is being able to dynamically capture an image of the tile and send that to the UX layer.
    * In addition to showing the dialog, we should display graphics in Phaser to indicate that the tile is being queried. Maybe a magnifying glass animation?
    * FUTURE: Let's figure out if any tools or in-game interactions should automatically close this dialog.
