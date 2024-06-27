import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';

const Rebar = useRebar();

export const animations = {
    groundSearch: (player: alt.Player, duration: number = 1000) => {
        // Do something
        return new Promise((resolve) => {
            Rebar.player.useAnimation(player).playInfinite('amb@medic@standing@kneel@base', 'base', 1);
            Rebar.player
                .useAnimation(player)
                .playInfinite('anim@gangops@facility@servers@bodysearch@', 'player_search', 49);
            setTimeout(() => {
                player.clearTasks();
                resolve(true);
            }, duration);
        });
    },
    axeChop: async () => {
        // Do something
    },
};
