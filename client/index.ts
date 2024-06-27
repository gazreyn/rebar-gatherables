import * as alt from 'alt-client';
import { useRebarClient } from '@Client/index.js';
import { GatherablesEvents } from '../shared/events.js';
import type { ClientGatherable } from '../shared/gatherable.js';
import { distance } from '../shared/distance.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();

let uiTick: number | null = null;

/**
 * Stores all of the gatherables that are in range
 */
const gatherablesInRange: { [uid: string]: ClientGatherable } = {};

function updateUIPosition() {
    if (Object.keys(gatherablesInRange).length === 0) {
        // Clear the UI and stop tick
        cleanUp();
        return;
    }

    const gatherablePositions: { [uid: string]: { x: number; y: number; z: number } } = {};

    for (const uid in gatherablesInRange) {
        const gatherable = gatherablesInRange[uid];
        const { x, y, z, range } = gatherable.interactionPos;
        const playerDistanceFromGatherable = distance({ x, y, z }, alt.Player.local.pos);
        const movedOutOfRange = playerDistanceFromGatherable > range && gatherable.inRange;
        const movedInToRange = playerDistanceFromGatherable < range && !gatherable.inRange;

        if (movedOutOfRange) {
            gatherable.inRange = false;
            webview.emit(GatherablesEvents.toWebview.UPDATE_GATHERABLE, uid, gatherable);
        } else if (movedInToRange) {
            gatherable.inRange = true;
            webview.emit(GatherablesEvents.toWebview.UPDATE_GATHERABLE, uid, gatherable);
        }

        const screenPos = alt.worldToScreen(x, y, z + 1);
        gatherablePositions[uid] = screenPos;
    }

    webview.emit(GatherablesEvents.toWebview.UPDATE_WORLD_POSITIONS, gatherablePositions);
}

function updateGatherablesInUI(gatherables: { [uid: string]: ClientGatherable }) {
    alt.log('updateGatherablesInUI');
    webview.emit(GatherablesEvents.toWebview.UPDATE_GATHERABLES, gatherables);
}

function clearUI() {
    // Maybe TODO: Clear the UI
    webview.emit(GatherablesEvents.toWebview.CLEAR);
}

function cleanUp() {
    clearUI();
    if (uiTick) alt.clearEveryTick(uiTick);
    uiTick = null;
}

function playerEnteredGatherable(uid: string, gatherable: ClientGatherable) {
    alt.log('Entered Gatherable', uid);

    if (!uiTick) {
        uiTick = alt.everyTick(updateUIPosition);
    }

    gatherablesInRange[uid] = gatherable;
    updateGatherablesInUI(gatherablesInRange);
}

function playerLeftGatherable(uid: string) {
    alt.log('Left Gatherable', uid);
    delete gatherablesInRange[uid];
}

function playerPickedUpGatherable(uid: string) {
    alt.log('Picked up Gatherable', uid);
    delete gatherablesInRange[uid];
}

alt.onServer(GatherablesEvents.toClient.ENTER, playerEnteredGatherable);
alt.onServer(GatherablesEvents.toClient.LEAVE, playerLeftGatherable);
alt.onServer(GatherablesEvents.toClient.PICKUP, playerPickedUpGatherable);
