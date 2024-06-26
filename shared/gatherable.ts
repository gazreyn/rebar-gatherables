import { type Skill } from '../server/index.js';

// gatherable.model
// gatherable.object
// gatherable.physicalObject
// gatherable

export type Gatherable = {
    /**
     * The name of the gatherable
     */
    name: string;
    /**
     * Rebar Permission required to gather the item
     * @link https://rebarv.com/api/server/document/document-character/#permissions
     */
    skillRequired: Skill | null;
    /**
     * Used to check if player has required skill level (if skillPermission is set)
     */
    skillLevel: number;
    /**
     * The range of material a gatherable holds, in the form of [min, max]
     */
    materialQuantityRange: [number, number];
    entity: {
        /**
         * Object model. Null if gatherable will utilize an existing object
         * @link https://gta-objects.xyz/
         */
        model: string | null;
        /**
         * Position of the object and interaction
         */
        pos: { x: number; y: number; z: number };
        rot: { x: number; y: number; z: number };
        /**
         * At what point the user will see that the object can be interacted with
         * @link https://rebarv.com/api/server/controllers/interaction/#create
         */
        visibilityRange: number;
        /**
         * How far away pressing the interact button will do something
         */
        interactRange: number;
        /**
         * To make sure animations don't go inside the object
         */
        collisionRange: number;
    };
    /**
     * The amount of time before a gatherable will respawn.
     */
    respawnDelay: number;
};

// gatherable.skill.type
// gatherable.player.hasSkill

export type ClientGatherable = {
    name: string;
    character: {
        hasSkill: boolean;
        hasSkillLevel: boolean;
        hasEquipment?: boolean;
    };
    skill: {
        type: Skill | null;
        level: number;
    };
    interactionPos: { x: number; y: number; z: number; range: number };
    // entity: {
    //     model: string;
    //     pos: { x: number; y: number; z: number };
    //     rot: { x: number; y: number; z: number };
    //     radius: number;
    //     collisionRange: number;
    // };
    inRange: boolean;
};
