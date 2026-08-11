/**
 * Classes and methods for representing autonomous agents in the player's World.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Lifeform } from '../world/Lifeforms';

/** The properties in this interface are used to populate initial information for Characters in the player's World.
 * Using a typed object reduces the odds of developer error.
 */
interface CharacterConstructorArgs {
    name: string;
    species: Lifeform;
    spriteKey: string;
    timeCreated: number;
    x?: number;
    y?: number;
    isProtected: boolean;
}

export class Character {
    private readonly id: string;
    public readonly timeCreated: number; // TODO: Should this be a simulation tick?

    public name: string;
    public species: Lifeform;
    public spriteKey: string; // FUTURE: Sentient characters may want to have alternative graphics options beyond their species' sprite.
    public isProtected: boolean;

    public x?: number;
    public y?: number;

    // TODO: Figure out how to represent allowed behaviors and their time costs (i.e, how often can the character attempt to move?).
    // We should most likely use setters here to allow for error trapping. This is handy if potential behaviors are mutually exclusive.
    private allowedBehaviors = [];

    constructor(args: CharacterConstructorArgs) {
        this.id = uuidv4();
        this.timeCreated = args.timeCreated; // DEBUG
        this.name = args.name;
        this.species = args.species;
        this.spriteKey = args.spriteKey;
        this.isProtected =  args.isProtected;

        this.x = args.x ?? undefined;
        this.y = args.y ?? undefined;
    }
}