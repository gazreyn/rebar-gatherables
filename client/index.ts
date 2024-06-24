import * as alt from 'alt-client';
// import * as native from 'natives';
import { useRebarClient } from '@Client/index.js';
import { GatherablesEvents } from '../shared/events.js';
import type { ClientGatherable } from '../shared/gatherable.js';
import { distance } from '../shared/distance.js';
import { check } from '@Server/utility/password.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();

let checkPosTick: number | null = null;
let currentGatherable: ClientGatherable | null = null;

function updateUIFromCurrentGatherablePosition() {
    // If this is somehow running when no gatherable is in range, clear the tick
    if (!currentGatherable || !currentGatherable.objectInfo) {
        clear();
        return;
    }

    const screenPos = alt.worldToScreen(
        currentGatherable.objectInfo.pos.x,
        currentGatherable.objectInfo.pos.y,
        currentGatherable.objectInfo.pos.z + 1,
    );

    const playerDistanceFromGatherable = distance(currentGatherable.objectInfo.pos, alt.Player.local.pos);

    const movedOutOfRange =
        playerDistanceFromGatherable > currentGatherable.interactDistance && currentGatherable.inRange;
    const movedInToRange =
        playerDistanceFromGatherable < currentGatherable.interactDistance && !currentGatherable.inRange;

    // TODO: Maybe better handling of scenarios here
    if (movedOutOfRange) {
        currentGatherable.inRange = false;
        // TODO: Could make this emit a single property instead of object
        webview.emit(GatherablesEvents.UPDATE_UI, currentGatherable);
    } else if (movedInToRange) {
        currentGatherable.inRange = true;
        webview.emit(GatherablesEvents.UPDATE_UI, currentGatherable);
    }

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

alt.onServer(GatherablesEvents.ON_ENTER, (gatherable: ClientGatherable) => {
    alt.log('Entered Gatherable', JSON.stringify(gatherable));

    if (checkPosTick) return; // This is already running for another gatherable

    currentGatherable = gatherable;

    updateUI(currentGatherable);
    checkPosTick = alt.everyTick(updateUIFromCurrentGatherablePosition);
});

alt.onServer(GatherablesEvents.ON_LEAVE, (gatherable: ClientGatherable) => {
    alt.log('Left Gatherable', JSON.stringify(gatherable));
    clear();
    // hideUI();
    // alt.clearEveryTick(checkPosTick);
});

/*
const myObjectHash = native.getHashKey('bkr_prop_weed_med_01b');
const objectDimension = native.getModelDimensions(myObjectHash, alt.Vector3.zero, alt.Vector3.zero);
const [,y,z] = objectDimension;
const halfObjectY = y.x / 2;

let objectFound = false;

type interactionData = {
    pos: alt.IVector3;
    inRange: boolean;
}

intervalTick = alt.everyTick(function () {
    const { x, y, z } = alt.Player.local.pos;
    const object = native.getClosestObjectOfType(x, y, z, 8.0, myObjectHash, false, false, false);

    // If no object of type exists, return
    if (!object && objectFound) {
        // Let UI know to stop showing
        webview.emit('interaction:update', null);
        // Set objectFound to false
        objectFound = false;
    }

    if (!object) return;

    objectFound = true;

    // Get the coordinates of the object
    const objectCoords = native.getEntityCoords(object, false);

    // Check if the object is in view
    // if (!native.hasEntityClearLosToEntity(alt.Player.local.scriptID, object, 17)) return;

    // Convert the coordinates to screen coordinates
    const screenPos = alt.worldToScreen(objectCoords.x, objectCoords.y, objectCoords.z + 1);

    if (!screenPos) return; // Even if object is close, not in view

    webview.emit('interaction:update', screenPos);
});

alt.clearEveryTick(intervalTick);*/
