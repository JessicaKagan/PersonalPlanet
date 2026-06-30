/** A list of constant values used in Personal Planet. In the long term, we may want to split this into multiple files.
 * We should also plan to make more values dynamically configurable where it makes sense. In that case, expect many of these
 * to become defaults.
 */

export const DEFAULT_SIMULATION_TICKS_PER_SECOND = 50;

export const MINIMUM_ZOOM_FACTOR = 1;
export const MAXIMUM_ZOOM_FACTOR = 1 / 16;
export const DEFAULT_ZOOM_TICK = Math.sqrt(2); // Using a number that "cleanly" multiplies into 2 allows the user finer zooming, while keeping the values predictable.


/** These enums are used by components in the UX layer. */
export enum WorldControlsTools {
    None, Query, Draw
}

export enum TileInformationDialogMode {
    HOVER,
    DETAILED
}

/** These enums are used when we want to emit and subscribe to Phaser events. */
export enum CustomPhaserEvents {
    CurrentSceneReady = 'CurrentSceneReady',
    CurrentWorldControlToolSelected = 'CurrentWorldControlToolSelected',
    CursorPositionInViewPort = 'CurrentPositionInViewPort'
}