import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { GatherablesEvents } from '../shared/events.js';
import type { Gatherable, ClientGatherable } from '../shared/gatherable.js';

// const gatheringSessionKey = 'gathering-session';

const Rebar = useRebar();

type SessionGatherable = {
    data: Gatherable;
    session: {
        /**
         * The player that is currently interacting with the node. Null if not being interacted
         */
        player: alt.Player | null;
        object: ReturnType<typeof Rebar.controllers.useObjectGlobal> | null;
        respawnAtTime: number;
    };
};

/**
 * Map of all spawned gatherables, Key is UID of interaction
 * @type {Map<string, SessionGatherable>}
 */
const spawnedGatherables: Map<string, SessionGatherable> = new Map();

/**
 * Set of all gatherables that are due to respawn. Key is UID of interaction
 */
const gatherablesToRespawn: Set<string> = new Set();

export function useGatherableSystem() {
    function create(gatherable: Gatherable) {
        //
        const interaction = Rebar.controllers.useInteraction(
            new alt.ColshapeCylinder(
                gatherable.colShape.x,
                gatherable.colShape.y,
                gatherable.colShape.z,
                gatherable.colShape.radius,
                2,
            ),
            'player',
        );

        interaction.on(onInteract);
        interaction.onEnter(onEnter);
        interaction.onLeave(onLeave);

        const sessionGatherable: SessionGatherable = {
            data: { ...gatherable },
            session: {
                player: null,
                object: null,
                respawnAtTime: 0,
            },
        };

        spawnedGatherables.set(interaction.uid, sessionGatherable);

        return interaction.uid;
    }

    function spawn(uid: string) {
        const gatherable = spawnedGatherables.get(uid);

        if (!gatherable) {
            alt.log('ERROR: No gatherable found with UID: ' + uid);
            return;
        }

        /**
         * We only create the object if objectInfo is not null
         */
        if (gatherable.data.objectInfo !== null) {
            gatherable.session.object = Rebar.controllers.useObjectGlobal({
                model: alt.hash(gatherable.data.objectInfo.model),
                pos: gatherable.data.objectInfo.pos,
            });
        }

        gatherablesToRespawn.delete(uid);
    }

    async function onEnter(player: alt.Player, colshape: alt.Colshape, uid: string) {
        alt.log(`onEnter: ${uid}`);

        // Is the interaction already spawned?
        if (gatherablesToRespawn.has(uid)) {
            alt.log('onEnter: Gatherable is not spawned yet');
            return;
        }

        const { name, skillLevel, skillPermission, objectInfo, interactDistance } = spawnedGatherables.get(uid).data;

        const clientGatherable: ClientGatherable = {
            name,
            skillLevel,
            skillPermission,
            objectInfo,
            interactDistance,
            inRange: false,
        };

        alt.emitClient(player, GatherablesEvents.ON_ENTER, clientGatherable);
    }

    async function onInteract(player: alt.Player, colshape: alt.Colshape, uid: string) {
        alt.log('onInteract');

        // 1. Is the gatherable spawned and ready?
        if (gatherablesToRespawn.has(uid)) {
            alt.log('onEnter: Gatherable has already been looted');
            return;
        }

        const gatherable = spawnedGatherables.get(uid);

        // 2. Is the player close enough to the object to interact ??
        if (colshape.pos.distanceTo(player.pos) > gatherable.data.interactDistance) {
            alt.log('onInteract: Player is too far away');
            return;
        }

        const rPlayer = Rebar.usePlayer(player);

        alt.log(rPlayer.character.permission.hasAnyGroupPermission('gathering', ['gardener']));
        alt.log(rPlayer.character.permission.hasGroupPermission('gathering', 'gardener'));
        return;

        // 3. Does the player meet the necessary requirements? (skillLevel, skillPermission and maybe equipment in the future)
        if (
            gatherable.data.skillPermission &&
            !rPlayer.character.permission.hasGroupPermission('gathering', 'gardener')
        ) {
            alt.log("onInteract: You don't have the required permission/skill");
            return;
        }

        alt.log('onInteract: Player is close enough, DO SOMETHING');

        // 1. Is player close enough to the object to interact ??
        // 2. Does the player meet the necessary requirements? (skillLevel, skillPermission and maybe equipment in the future)
        // 3. If so, move the player to the object, this may be handled by the client
        // 4.
    }

    async function onLeave(player: alt.Player, colshape: alt.Colshape, uid: string) {
        alt.log('onLeave');
        alt.emitClient(player, GatherablesEvents.ON_LEAVE, uid);
    }

    /**
     * Removes world objects and sets to respawn.
     * @param uid The UID of the interaction
     */
    function pickup(uid: string) {
        const gatherable = spawnedGatherables.get(uid);

        if (!gatherable) return; // No gatherable exists

        gatherable.session.object.destroy();
        gatherable.session.object = null;

        gatherablesToRespawn.add(uid);
    }

    /**
     * TODO: Cleans up all gatherables. Removing them from the map and deleting them
     */
    function cleanup() {}

    /**
     * Checks if gatherables are due to respawn and handles spawning them
     */
    function tick() {
        gatherablesToRespawn.forEach((uid) => {
            const gatherable = spawnedGatherables.get(uid);

            // No gatherable exists, so delete it
            if (!gatherable) {
                spawnedGatherables.delete(uid);
                return;
            }

            // If the gatherable isn't ready to spawn yet, do nothing
            if (gatherable.session.respawnAtTime > Date.now()) {
                return;
            }

            spawn(uid);
        });
    }

    return { create, spawn, tick };
}

async function movePedToGatherable(player: alt.Player, gatherable: SessionGatherable) {
    const gatherablePos = new alt.Vector3(
        gatherable.data.colShape.x,
        gatherable.data.colShape.y,
        gatherable.data.colShape.z,
    );

    // Calculate the direction vector from player to gatherable
    const direction = gatherablePos.sub(player.pos);

    // Normalize the direction vector
    const normalizedDirection = direction.normalize();

    // Scale the normalized vector to the desired radius
    const radius = 1; // TODO: Make this configurable
    const targetPos = gatherablePos.sub(normalizedDirection.mul(radius));

    const playerPed = Rebar.controllers.usePed(player);

    // TODO: maybe use Rebar.player.useNative(player).invoke in the future
    const offsetRotRadians = (270 * Math.PI) / 180; // Not sure why we have to do this
    const targetHeadingInRadians = Math.atan2(direction.y, direction.x) + offsetRotRadians;
    const targetHeadingInDegrees = (targetHeadingInRadians * 180) / Math.PI;

    playerPed.invoke(
        'taskGoStraightToCoord',
        targetPos.x,
        targetPos.y,
        targetPos.z,
        1.0,
        -1,
        targetHeadingInDegrees,
        1.0,
    );

    let retries = 0;
    const retryLimit = 50;

    await new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            // Have some end state of this
            if (retries > retryLimit) {
                clearInterval(interval);
                reject('Unable to move to gatherable');
                return;
            }

            const result = await playerPed.invokeRpc('isPedStopped');

            if (result) {
                // player.rot = new alt.Vector3(0.0, 0.0, targetHeading);
                clearInterval(interval);
                resolve(true);
            }
            retries++;
        }, 100);
    });
}
