import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { useGatherableSystem } from './useGatherable.js';
import type { Gatherable } from '../shared/gatherable.js';

const Rebar = useRebar();
const events = Rebar.events.useEvents();
const gatherableSystem = useGatherableSystem();

/**
 * Add new gathering skills here
 */
export const defaultCharacterData = {
    gathering_skills: {
        garderner: 0,
        hunter: 0,
    },
};

export type Skills = keyof typeof defaultCharacterData.gathering_skills;

events.on('character-bound', (player) => {
    setupGatherableSkillsIfNotSet(player);
    Rebar.player.useWebview(player).show('Interactions', 'page');
});

const defaultGatherables: Gatherable[] = [
    {
        name: 'Weed Plant',
        skillPermission: null,
        skillLevel: 0,
        materialQuantityRange: [1, 10],
        objectInfo: {
            model: 'bkr_prop_weed_med_01b',
            pos: { x: 922.3253173828125, y: -175.948974609375, z: 73.50727081298828 },
            rot: { x: 0, y: 0, z: 0 },
            radius: 1,
        },
        colShape: { x: 922.3253173828125, y: -175.948974609375, z: 73.50727081298828, radius: 5 },
        respawnDelay: 3000,
        interactDistance: 1,
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

Rebar.messenger.useMessenger().commands.register({
    name: '/veh',
    desc: 'Create a vehicle',
    callback: (player: alt.Player) => {
        const vehicle = new alt.Vehicle('infernus', player.pos, player.rot);
        alt.nextTick(() => {
            player.setIntoVehicle(vehicle, 1);
        });
    },
});
