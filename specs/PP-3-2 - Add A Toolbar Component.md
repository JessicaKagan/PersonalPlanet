This is a subset of PP-3. In this ticket, we'll be building out the user interface in this app, using the Svelte side of the project. I currently expect to use Svelte to build out most of the user interface, while using Phaser to handle the simulation, graphics, and audio. To do this, we'll need to do the following:

* Create logic to show and hide dialogs on top of the game world as needed.
    * This is going to be a Svelte component. We'll use the HTML dialog component as a base (thanks, semantics!) and Svelte itself to dynamically add relevant controls.
    * Specific dialogs will be separate components that inherit from the core dialog.
* Create the toolbar component itself - a dialog with a palette of tools (selectable by button) for interacting with the world. This is a core feature that will see frequent development as we add more to the simulation.
    * This component is similar to something you'd find in a paint program or photo editor.
* Add a testing feature to the toolbar. This will most likely the MVP for a "query" tool.
    * The primary purpose of this is to test the Phaser/Svelte integration and provide a baseline for further toolbar components.
    * A query tool in particular will ensure that we can send UX state information to Phaser, run relevant game logic, and then send that information to the UX layer.
