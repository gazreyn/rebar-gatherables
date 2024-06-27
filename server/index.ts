import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { useGatherableSystem } from './useGatherable.js';
import type { Gatherable } from '../shared/gatherable.js';

const Rebar = useRebar();
const events = Rebar.events.useEvents();
const gatherableSystem = useGatherableSystem();

export type Skill = keyof typeof defaultCharacterData.gathering_skills;

/**
 * Add new gathering skills here
 */
export const defaultCharacterData = {
    gathering_skills: {
        gardener: 0,
        hunter: 0,
    },
};

events.on('character-bound', (player) => {
    // const rCharacter = Rebar.usePlayer(player).character;
    setupGatherableSkillsIfNotSet(player);
    // rCharacter.permission.addGroupPerm('gathering', 'gardener'); // TODO: REMOVE THIS
    Rebar.player.useWebview(player).show('GatherableInteraction', 'page');
});

const defaultGatherables: Gatherable[] = [
    {
        name: 'Weed Plant',
        skillRequired: 'gardener',
        skillLevel: 0,
        materialQuantityRange: [1, 10],
        entity: {
            model: 'bkr_prop_weed_med_01b',
            pos: { x: 922.3253173828125, y: -175.948974609375, z: 73.50727081298828 },
            rot: { x: 0, y: 0, z: 0 },
            visibilityRange: 4,
            interactRange: 2,
            collisionRange: 1,
        },
        respawnDelay: 3000,
    },
    {
        name: 'Weed Plant',
        skillRequired: 'gardener',
        skillLevel: 0,
        materialQuantityRange: [1, 10],
        entity: {
            model: 'bkr_prop_weed_med_01b',
            pos: { x: 932.8433837890625, y: -172.8496856689453, z: 73.53227996826172 },
            rot: { x: 0, y: 0, z: 0 },
            visibilityRange: 4,
            interactRange: 2,
            collisionRange: 1,
        },
        respawnDelay: 3000,
    },
    {
        name: 'Weed Plant',
        skillRequired: 'gardener',
        skillLevel: 0,
        materialQuantityRange: [1, 10],
        entity: {
            model: 'bkr_prop_weed_med_01b',
            pos: {
                x: 926.1430053710938,
                y: -173.84901428222656,
                z: 73.37063598632812,
            },
            rot: { x: 0, y: 0, z: 0 },
            visibilityRange: 4,
            interactRange: 2,
            collisionRange: 1,
        },
        respawnDelay: 3000,
    },
    {
        name: 'Weed Plant',
        skillRequired: 'gardener',
        skillLevel: 0,
        materialQuantityRange: [1, 10],
        entity: {
            model: 'bkr_prop_weed_med_01b',
            pos: {
                x: 925.7051391601562,
                y: -177.15283203125,
                z: 73.398193359375,
            },
            rot: { x: 0, y: 0, z: 0 },
            visibilityRange: 4,
            interactRange: 2,
            collisionRange: 1,
        },
        respawnDelay: 3000,
    },
];

// Look through default gatherables and spawn;
defaultGatherables.forEach((gatherable) => {
    const uid = gatherableSystem.create(gatherable);
    gatherableSystem.spawn(uid);
});

// Maybe give a handle in the future so we can stop it / check if it is running
// alt.setInterval(gatherableSystem.tick, 1000);

function setupGatherableSkillsIfNotSet(player: alt.Player) {
    const rPlayer = Rebar.usePlayer(player);
    const currentSkills = rPlayer.character.getField<typeof defaultCharacterData>(
        'gathering_skills',
    ) as (typeof defaultCharacterData)['gathering_skills'];

    // let missingCharacterData: Partial<CharacterData> = {};
    let missingSkills: Partial<(typeof defaultCharacterData)['gathering_skills'] | null> = {};

    // If currentSkills is undefined, we need to set the default character data
    if (!currentSkills) {
        alt.log('No character data found, setting default character data');
        rPlayer.character.setBulk(defaultCharacterData);
        return;
    }

    for (const skill in defaultCharacterData.gathering_skills) {
        // Check if currentSkills has the skill. If not, add it to missingSkills
        if (Object.keys(currentSkills).includes(skill)) continue;

        alt.log(`${skill} is missing from the player's character data`);
        missingSkills[skill] = defaultCharacterData.gathering_skills[skill];
    }

    rPlayer.character.setBulk({
        gathering_skills: {
            ...currentSkills,
            ...missingSkills,
        },
    });
}
