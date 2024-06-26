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
            webview.emit(GatherablesEvents.UI_UPDATE_GATHERABLE_BY_UID, uid, gatherable);
        } else if (movedInToRange) {
            gatherable.inRange = true;
            webview.emit(GatherablesEvents.UI_UPDATE_GATHERABLE_BY_UID, uid, gatherable);
        }

        const screenPos = alt.worldToScreen(x, y, z + 1);
        gatherablePositions[uid] = screenPos;
    }

    webview.emit(GatherablesEvents.UI_UPDATE_GATHERABLE_POS, gatherablePositions);
}

function updateGatherablesInUI(gatherables: { [uid: string]: ClientGatherable }) {
    alt.log('updateGatherablesInUI');
    webview.emit(GatherablesEvents.UI_UPDATE_ALL_GATHERABLES, gatherables);
}

function clearUI() {
    // Maybe TODO: Clear the UI
    webview.emit(GatherablesEvents.UI_CLEAR);
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

alt.onServer(GatherablesEvents.ON_ENTER, playerEnteredGatherable);
alt.onServer(GatherablesEvents.ON_LEAVE, playerLeftGatherable);
