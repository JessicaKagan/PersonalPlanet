/** A list of constant values used in Personal Planet. Over time, we'll split this into multiple files.
 * We'll also make more values dynamically configurable where it makes sense, and otherwise use the values here as defaults.
 */

import type { Tile } from "../world/Tile";

export const DEFAULT_TILE_SIZE = 64;

export const DEFAULT_SIMULATION_TICKS_PER_SECOND = 50;
export const DEFAULT_SIMULATION_TICKS_PER_CLIMATE_UPDATE = 50; // TODO: We might want to make this significantly larger in the future!

export const MINIMUM_ZOOM_FACTOR = 1;
export const MAXIMUM_ZOOM_FACTOR = 1 / 16;
export const DEFAULT_ZOOM_TICK = Math.sqrt(2); // Using a number that "cleanly" multiplies into 2 allows the user finer zooming, while keeping the values predictable.

export const WATER_FREEZING_TEMPERATURE = 273;
export const WATER_BOILING_TEMPERATURE = 373;
export const SAFE_AVERAGE_TEMPERATURE = 288;

/** These enums are used by components in the UX layer. */
export enum WorldControlsTools {
    None, Query, Draw
}

export enum GraphicsOverlays {
    None, Lifeforms
}

export enum TileInformationDialogMode {
    HOVER,
    DETAILED
}

/** These enums are used when we want to emit and subscribe to Phaser events. */
export enum CustomPhaserEvents {
    CurrentSceneReady = 'CurrentSceneReady',
    CurrentWorldControlToolSelected = 'CurrentWorldControlToolSelected',
    CursorPositionInViewPort = 'CurrentPositionInViewPort',
    OverlaySelected = 'OverlaySelected',
    SimulationUpdated = 'SimulationUpdated',
    TileSelected = 'TileSelected'
}

/** FUTURE: This interface will be expanded as we add more to the simulation that we'd like to show using the query tool.
 */
export interface QueryInfo {
    tile?: Tile;
    customText?: string;
}