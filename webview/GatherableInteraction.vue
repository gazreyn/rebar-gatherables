<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import Item from './Item.vue';
import { useEvents } from '../../../../webview/composables/useEvents';
import { GatherablesEvents } from '../shared/events.js';
import type { ClientGatherable } from '../shared/gatherable.js';

const events = useEvents();

const gatherablesInRange = ref<{ [uid: string]: ClientGatherable }>({});
const gatherableUIPositions = ref<{ [uid: string]: { x: number; y: number; z: number } }>({});

// const gatherableData = computed(() => {
//     let newObj = {
//      };
// });

events.on(GatherablesEvents.UI_UPDATE_GATHERABLE_BY_UID, (uid: string, gatherable: ClientGatherable) => {
    console.log('UI_UPDATE_GATHERABLE_BY_UID', uid, gatherable);
    gatherablesInRange.value[uid] = gatherable;
});

events.on(
    GatherablesEvents.UI_UPDATE_GATHERABLE_POS,
    (gatherablePositions: { [uid: string]: { x: number; y: number; z: number } }) => {
        gatherableUIPositions.value = gatherablePositions;
    },
);

events.on(GatherablesEvents.UI_CLEAR, () => {
    console.log('UI_CLEAR');
    Object.keys(gatherablesInRange.value).forEach((uid) => {
        delete gatherablesInRange.value[uid];
    });
});

events.on(GatherablesEvents.UI_UPDATE_ALL_GATHERABLES, (gatherables: { [uid: string]: ClientGatherable }) => {
    gatherablesInRange.value = gatherables;
});
</script>

<template>
    <div>
        <Item
            v-for="(gatherable, uid) in gatherablesInRange"
            :key="uid"
            :gatherable="gatherable"
            :pos="gatherableUIPositions[uid]"
        />
    </div>
</template>

<style>
.circular-progress {
    --size: 250px;
    --half-size: calc(var(--size) / 2);
    --stroke-width: 20px;
    --radius: calc((var(--size) - var(--stroke-width)) / 2);
    --circumference: calc(var(--radius) * pi * 2);
    --dash: calc(25 * var(--circumference) / 100);
}

.circular-progress circle {
    cx: var(--half-size);
    cy: var(--half-size);
    r: var(--radius);
    stroke-width: var(--stroke-width);
    fill: none;
    stroke-linecap: round;
}

.circular-progress circle.bg {
    stroke: #ddd;
}

.circular-progress circle.fg {
    transform: rotate(-90deg);
    transform-origin: var(--half-size) var(--half-size);
    stroke-dasharray: var(--dash) calc(var(--circumference) - var(--dash));
    transition: stroke-dasharray 0.3s linear 0s;
}
</style>
