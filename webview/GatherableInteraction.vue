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

// events.on(GatherablesEvents.UI_UPDATE_GATHERABLE_POS_BY_UID, (uid: string, pos: { x: number; y: number; z: number }) => {
//     const uiSizeOffet = 80 / 2; // 40px
//     gatherablesInRange.value.get(uid).interactionPos.x = pos.x - uiSizeOffet;
//     gatherablesInRange.value.get(uid).interactionPos.y = pos.y - uiSizeOffet;
// });

events.on(GatherablesEvents.UI_UPDATE_ALL_GATHERABLES, (gatherables: { [uid: string]: ClientGatherable }) => {
    gatherablesInRange.value = gatherables;
    // console.log(gatherables.keys());
    // console.log(JSON.stringify(gatherables));
    // gatherablesInRange.value = gatherables;
});

// const interactionPosition = reactive({ x: 0, y: 0 });

// const activeGatherable = ref<ClientGatherable | null>(null);

// const isHidden = computed(() => {
//     return !activeGatherable.value;
// });

// const computedStyles = computed(() => {
//     return {
//         transform: `translate3d(${interactionPosition.x}px, ${interactionPosition.y}px, 0)`,
//     };
// });

// const canInteract = computed(() => {
//     return (
//         activeGatherable.value &&
//         activeGatherable.value.character.hasSkill &&
//         activeGatherable.value.character.hasSkillLevel
//     );
// });

// events.on(GatherablesEvents.UPDATE_UI_POSITION, (pos: { x: number; y: number; z: number }) => {
//     const uiSizeOffet = 80 / 2; // 40px

//     interactionPosition.x = pos.x - uiSizeOffet;
//     interactionPosition.y = pos.y - uiSizeOffet;
// });

// events.on(GatherablesEvents.UPDATE_UI, (gatherable: (ClientGatherable & { inRange: boolean }) | null) => {
//     activeGatherable.value = gatherable;
// });
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
