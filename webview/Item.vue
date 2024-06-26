<script lang="ts" setup>
import { computed } from 'vue';
import { ClientGatherable } from '../shared/gatherable';

const props = defineProps<{
    gatherable: ClientGatherable;
    pos: { x: number; y: number; z: number };
}>();

const computedStyles = computed(() => {
    const uiSizeOffet = 80 / 2; // 40px
    return {
        transform: `translate3d(${props.pos.x - uiSizeOffet}px, ${props.pos.y - uiSizeOffet}px, 0)`,
    };
});

const canInteract = computed(() => {
    return props.gatherable.character.hasSkill && props.gatherable.character.hasSkillLevel;
});
</script>

<template>
    <div>
        <!-- Interaction Wrapper -->
        <div class="fixed block" :style="computedStyles">
            <!-- Circle Wrapper-->
            <template v-if="gatherable.inRange">
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

<style></style>
