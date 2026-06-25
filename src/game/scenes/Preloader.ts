import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');

        // Tiles
        this.load.image([
            { key: 'algae green', url: '/tiles/algae green.png' },
            { key: 'basalt', url: '/tiles/basalt.png' },
            { key: 'algae green', url: '/tiles/cave gravel 2.png' },
            { key: 'coldcliff', url: '/tiles/coldcliff.png' },
            { key: 'clay', url: '/tiles/clay.png' },
            { key: 'cliff ice', url: '/tiles/cliff ice.png' },
            { key: 'cliff', url: '/tiles/cliff.png' },
            { key: 'cyan grass', url: '/tiles/cyan grass.png' },
            { key: 'deep ocean', url: '/tiles/deepocean.png' },
            { key: 'dryland', url: '/tiles/dryland.png' },
            { key: 'farmland', url: '/tiles/farmland.png' },
            { key: 'forest', url: '/tiles/modified forest.png' },
            { key: 'grass', url: '/tiles/grass.png' },
            { key: 'gravel', url: '/tiles/gravel.png' },
            { key: 'higherland', url: '/tiles/higherland.png' },
            { key: 'ice', url: '/tiles/ice.png' },
            { key: 'junglegrass', url: '/tiles/junglegrass.png' },
            { key: 'mountain floor', url: '/tiles/mountainfloor.png' },
            { key: 'mud', url: '/tiles/mud.png' },
            { key: 'ocean', url: '/tiles/ocean.png' },
            { key: 'permasnow', url: '/tiles/permasnow.png' },
            { key: 'quartzite cliff', url: '/tiles/quartzite cliff.png' },
            { key: 'sand', url: '/tiles/sand.png' },
            { key: 'savannah', url: '/tiles/savannah.png' },
            { key: 'shallow water', url: '/tiles/shallowwater.png' },
            { key: 'snow', url: '/tiles/snow.png' },
            { key: 'swamp', url: '/tiles/swamp grass mar.png' },
            { key: 'taiga', url: '/tiles/taiga.png' },
            { key: 'tundra', url: '/tiles/tundra.png' },
            { key: 'tundra snowy', url: '/tiles/tundra snowy.png' },

            // FUTURE: We'll remove assets once we have more clarity on what sorts of tiles we want to include.

            // { key: 'algae green', url: 'tiles/cave coral black weakened.png' },
            // { key: 'algae green', url: 'tiles/cave coral black.png' },
            // { key: 'algae green', url: 'tiles/cave gravel 3.png' },
            // { key: 'algae green', url: 'tiles/cave gravel 4.png' },
            // { key: 'algae green', url: 'tiles/cave gravel 5.png' },
            // { key: 'algae green', url: 'tiles/cave gravel pit 1.png' },
            // { key: 'algae green', url: 'tiles/cave gravel pit 2.png' },
            // { key: 'algae green', url: 'tiles/cave gravel pit 3.png' },
            // { key: 'algae green', url: 'tiles/cave gravel.png' },
            // { key: 'algae green', url: 'tiles/cave ice.png' },
            // { key: 'algae green', url: 'tiles/cave magma cold.png' },
            // { key: 'algae green', url: 'tiles/cave magma.png' },
            // { key: 'algae green', url: 'tiles/cave wall.png' },
            // { key: 'algae green', url: 'tiles/cave water stalagmite.png' },
            // { key: 'algae green', url: 'tiles/caveCliff2.png' },
            // { key: 'algae green', url: 'tiles/caveCliff3.png' },
            // { key: 'algae green', url: 'tiles/caveCliff4.png' },
            // { key: 'algae green', url: 'tiles/caveCliff5.png' },
            // { key: 'algae green', url: 'tiles/cavewater.png' },
            // { key: 'algae green', url: 'tiles/coldCaveGravel.png' },
            // { key: 'algae green', url: 'tiles/construction path snowy.png' },
            // { key: 'algae green', url: 'tiles/construction path.png' },
            // { key: 'algae green', url: 'tiles/coral black weakened.png' },
            // { key: 'algae green', url: 'tiles/coral black.png' },
            // { key: 'algae green', url: 'tiles/coral blue chars.png' },
            // { key: 'algae green', url: 'tiles/coral blue.png' },
            // { key: 'algae green', url: 'tiles/coral orange.png' },
            // { key: 'algae green', url: 'tiles/coralgreen.png' },
            // { key: 'algae green', url: 'tiles/coralred.png' },
            // { key: 'algae green', url: 'tiles/coralyellow.png' },
            // { key: 'algae green', url: 'tiles/darkCaveGravel.png' },
            // { key: 'algae green', url: 'tiles/darkcliff.png' },
            // { key: 'algae green', url: 'tiles/dustgrass.png' },
            // { key: 'algae green', url: 'tiles/dustland.png' },
            // { key: 'algae green', url: 'tiles/granite cliff.png' },
            // { key: 'algae green', url: 'tiles/granite floor.png' },
            // { key: 'algae green', url: 'tiles/granite tile.png' },
            // { key: 'algae green', url: 'tiles/grass cold.png' },
            // { key: 'algae green', url: 'tiles/grass dry.png' },
            // { key: 'algae green', url: 'tiles/grass nov.png' },
            // { key: 'algae green', url: 'tiles/grass oct.png' },
            // { key: 'algae green', url: 'tiles/grass sep.png' },
            // { key: 'algae green', url: 'tiles/grass snowy.png' },
            // { key: 'algae green', url: 'tiles/highland arid.png' },
            // { key: 'algae green', url: 'tiles/highland snowy.png' },
            // { key: 'algae green', url: 'tiles/highland.png' },
            // { key: 'algae green', url: 'tiles/infested gravel.png' },
            // { key: 'algae green', url: 'tiles/landcoralblack.png' },
            // { key: 'algae green', url: 'tiles/lilypad.png' },
            // { key: 'algae green', url: 'tiles/map tile city.png' },
            // { key: 'algae green', url: 'tiles/map tile forest.png' },
            // { key: 'algae green', url: 'tiles/map tile grass.png' },
            // { key: 'algae green', url: 'tiles/map tile mountain.png' },
            // { key: 'algae green', url: 'tiles/map tile ocean.png' },
            // { key: 'algae green', url: 'tiles/map tile sand.png' },
            // { key: 'algae green', url: 'tiles/monsoongrass.png' },
            // { key: 'algae green', url: 'tiles/path snowy.png' },
            // { key: 'algae green', url: 'tiles/path.png' },
            // { key: 'algae green', url: 'tiles/path2 snowy.png' },
            // { key: 'algae green', url: 'tiles/path2.png' },
            // { key: 'algae green', url: 'tiles/pebbles cave.png' },
            // { key: 'algae green', url: 'tiles/pebbles snow.png' },
            // { key: 'algae green', url: 'tiles/pebbles.png' },
            // { key: 'algae green', url: 'tiles/quartzite floor.png' },
            // { key: 'algae green', url: 'tiles/quartzite tile.png' },
            // { key: 'algae green', url: 'tiles/sand ash.png' },
            // { key: 'algae green', url: 'tiles/sand orange.png' },
            // { key: 'algae green', url: 'tiles/sand white.png' },
            // { key: 'algae green', url: 'tiles/stone tile.png' },
            // { key: 'algae green', url: 'tiles/swamp grass nov.png' },
            // { key: 'algae green', url: 'tiles/swamp grass oct.png' },
            // { key: 'algae green', url: 'tiles/swamp grass sep.png' },
            // { key: 'algae green', url: 'tiles/swamp grass snowy.png' },
            // { key: 'algae green', url: 'tiles/taidra.png' },
            // { key: 'algae green', url: 'tiles/thornfloor damp.png' },
            // { key: 'algae green', url: 'tiles/thornfloor dry.png' },
            // { key: 'algae green', url: 'tiles/thornfloor snowy.png' },
            // { key: 'algae green', url: 'tiles/thornfloor.png' },
            // { key: 'algae green', url: 'tiles/water.png' },
            // { key: 'algae green', url: 'tiles/wood tile.png' },
            // { key: 'algae green', url: 'tiles/wood wall.png' },
            // { key: 'algae green', url: 'tiles/woodpath snowy.png' },
            // { key: 'algae green', url: 'tiles/woodpath.png' },
            // { key: 'algae green', url: 'tiles/woodpath2.png' },
            // { key: 'algae green', url: 'tiles/yellow grass.png' },
        ])
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
