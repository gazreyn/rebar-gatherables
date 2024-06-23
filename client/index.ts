import * as alt from 'alt-client';
// import * as native from 'natives';
import { useRebarClient } from '@Client/index.js';
import { GatherablesEvents } from '../shared/events.js';
import type { ClientGatherable } from '../shared/gatherable.js';

const Rebar = useRebarClient();
const webview = Rebar.webview.useWebview();

let checkPosTick: number;

type UIGatherable = ClientGatherable & { inRange: boolean };

let currentGatherable: UIGatherable | null = null;

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

    if (playerDistanceFromGatherable > 3 && currentGatherable.inRange) {
        currentGatherable.inRange = false;
        webview.emit(GatherablesEvents.UPDATE_UI, currentGatherable);
    } else if (playerDistanceFromGatherable < 3 && !currentGatherable.inRange) {
        currentGatherable.inRange = true;
        webview.emit(GatherablesEvents.UPDATE_UI, currentGatherable);
    }

    webview.emit(GatherablesEvents.UPDATE_UI_POSITION, screenPos);
}

function updateUI(data: UIGatherable) {
    webview.emit(GatherablesEvents.UPDATE_UI, data);
}

function hideUI() {
    webview.emit(GatherablesEvents.UPDATE_UI, null);
}

function clear() {
    currentGatherable = null;
    hideUI();
    alt.clearEveryTick(checkPosTick);
}

function distance(vector1: { x: number; y: number; z: number }, vector2: { x: number; y: number; z: number }) {
    if (vector1 === undefined || vector2 === undefined) {
        throw new Error('AddVector => vector1 or vector2 is undefined');
    }

    return Math.sqrt(
        Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2) + Math.pow(vector1.z - vector2.z, 2),
    );
}

alt.onServer(GatherablesEvents.ON_ENTER, (gatherable: ClientGatherable) => {
    alt.log('Entered Gatherable', JSON.stringify(gatherable));

    currentGatherable = {
        ...gatherable,
        inRange: false,
    };

    updateUI(currentGatherable);
    checkPosTick = alt.everyTick(updateUIFromCurrentGatherablePosition);
});

alt.onServer(GatherablesEvents.ON_LEAVE, (gatherable: ClientGatherable) => {
    alt.log('Left Gatherable', JSON.stringify(gatherable));
    hideUI();
    alt.clearEveryTick(checkPosTick);
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
