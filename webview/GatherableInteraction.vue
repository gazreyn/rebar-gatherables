<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { useEvents } from '../../../../webview/composables/useEvents';
import { GatherablesEvents } from '../shared/events.js';
import type { ClientGatherable } from '../shared/gatherable.js';

const events = useEvents();

const interactionPosition = reactive({ x: 0, y: 0 });

const activeGatherable = ref<ClientGatherable | null>(null);

const isHidden = computed(() => {
    return !activeGatherable.value;
});

const computedStyles = computed(() => {
    return {
        transform: `translate3d(${interactionPosition.x}px, ${interactionPosition.y}px, 0)`,
    };
});

const canInteract = computed(() => {
    return (
        activeGatherable.value &&
        activeGatherable.value.character.hasSkill &&
        activeGatherable.value.character.hasSkillLevel
    );
});

events.on(GatherablesEvents.UPDATE_UI_POSITION, (pos: { x: number; y: number; z: number }) => {
    const uiSizeOffet = 80 / 2; // 40px

    interactionPosition.x = pos.x - uiSizeOffet;
    interactionPosition.y = pos.y - uiSizeOffet;
});

events.on(GatherablesEvents.UPDATE_UI, (gatherable: (ClientGatherable & { inRange: boolean }) | null) => {
    activeGatherable.value = gatherable;
});

const progress = ref(50);
</script>

<template>
    <div>
        <!-- Interaction Wrapper -->
        <div v-if="!isHidden" class="fixed block" :style="computedStyles">
            <!-- Circle Wrapper-->
            <template v-if="activeGatherable.inRange">
                <div class="relative h-20 w-20">
                    <!-- Circle Progress Bar -->
                    <!-- Stroke-->
                    <svg width="100%" height="100%" viewBox="0 0 250 250" class="circular-progress absolute opacity-25">
                        <circle class="stroke-slate-50"></circle>
                    </svg>
                    <svg width="100%" height="100%" viewBox="0 0 250 250" class="circular-progress absolute">
                        <circle class="fg stroke-slate-50"></circle>
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span
                            class="rounded-md border-2 border-x-slate-50 px-4 py-1 text-white"
                            :class="[canInteract ? 'bg-green-500' : 'bg-red-500']"
                        >
                            {{ canInteract ? 'E' : 'X' }}
                        </span>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="relative flex h-20 w-20 items-center justify-center">
                    <span class="h-4 w-4 rounded-full border-2 border-slate-50"></span>
                </div>
            </template>
        </div>
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
