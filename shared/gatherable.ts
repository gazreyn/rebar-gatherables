import { type Skills } from '../server/index.js';

export type Gatherable = {
    /**
     * The name of the gatherable
     */
    name: string;
    /**
     * Rebar Permission required to gather the item
     * @link https://rebarv.com/api/server/document/document-character/#permissions
     */
    skillPermission: Skills | null;
    /**
     * Used to check if player has required skill level (if skillPermission is set)
     */
    skillLevel: number;
    /**
     * The range of material a gatherable holds, in the form of [min, max]
     */
    materialQuantityRange: [number, number];
    /**
     * The position of the interaction
     * @link https://rebarv.com/api/server/controllers/interaction/#create
     */
    colShape: { x: number; y: number; z: number; radius: number };
    /**
     * World model - Null if gatherable should be existing object
     * @link https://gta-objects.xyz/
     */
    objectInfo: {
        model: string;
        pos: { x: number; y: number; z: number };
        rot: { x: number; y: number; z: number };
        /**
         * To make sure animations don't go inside the object
         */
        radius: number;
    } | null;
    /**
     * The amount of time before a gatherable will respawn.
     */
    respawnDelay: number;
    /**
     * How far away someone can interact with the node
     */
    interactDistance: number;
};

export type ClientGatherable = Pick<Gatherable, 'name' | 'skillPermission' | 'skillLevel' | 'objectInfo'>;
