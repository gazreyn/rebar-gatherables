import * as alt from 'alt-client';
import { useRebarClient } from '@Client/index.js';
import { GatherablesEvents } from '../shared/events.js';
import type { ClientGatherable } from '../shared/gatherable.js';
import { distance } from '../shared/distance.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();

let checkPosTick: number | null = null;
let currentGatherable: ClientGatherable | null = null;

function updateUIFromCurrentGatherablePosition() {
    // If this is somehow running when no gatherable is in range, clear the tick
    if (!currentGatherable) {
        clear();
        return;
    }

    const { x, y, z, range } = currentGatherable.interactionPos;

    const playerDistanceFromGatherable = distance({ x, y, z }, alt.Player.local.pos);

    const movedOutOfRange = playerDistanceFromGatherable > range && currentGatherable.inRange;
    const movedInToRange = playerDistanceFromGatherable < range && !currentGatherable.inRange;

    // TODO: Maybe better handling of scenarios here
    if (movedOutOfRange) {
        currentGatherable.inRange = false;
        // TODO: Could make this emit a single property instead of object
        webview.emit(GatherablesEvents.UPDATE_UI, currentGatherable);
    } else if (movedInToRange) {
        currentGatherable.inRange = true;
        webview.emit(GatherablesEvents.UPDATE_UI, currentGatherable);
    }

    const screenPos = alt.worldToScreen(x, y, z + 1);

    webview.emit(GatherablesEvents.UPDATE_UI_POSITION, screenPos);
}

function updateUI(data: ClientGatherable) {
    webview.emit(GatherablesEvents.UPDATE_UI, data);
}

function hideUI() {
    webview.emit(GatherablesEvents.UPDATE_UI, null);
}

function clear() {
    currentGatherable = null;
    hideUI();
    alt.clearEveryTick(checkPosTick);
    checkPosTick = null;
}

alt.onServer(GatherablesEvents.ON_ENTER, (uid: string, gatherable: ClientGatherable) => {
    alt.log('Entered Gatherable', JSON.stringify(gatherable));

    if (checkPosTick) return; // This is already running for another gatherable

    currentGatherable = gatherable;

    updateUI(currentGatherable);
    checkPosTick = alt.everyTick(updateUIFromCurrentGatherablePosition);
});

alt.onServer(GatherablesEvents.ON_LEAVE, (gatherable: ClientGatherable) => {
    alt.log('Left Gatherable', JSON.stringify(gatherable));
    clear();
});
