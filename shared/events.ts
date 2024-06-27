export const GatherablesEvents = {
    ON_ENTER: 'gatherables:on-enter',
    ON_LEAVE: 'gatherables:on-leave',
    ON_INTERACT: 'gatherables:on-interact',
    UI_UPDATE_ALL_GATHERABLES: 'gatherables:ui:update-all',
    UI_UPDATE_GATHERABLE_POS: 'gatherables:ui:position-all',
    UI_UPDATE_GATHERABLE_BY_UID: 'gatherables:ui:update',
    UI_UPDATE_GATHERABLE_POS_BY_UID: 'gatherables:ui:position',
    UI_CLEAR: 'gatherables:ui:clear',
    toWebview: {
        UPDATE_GATHERABLES: 'gatherables:webview:update-gatherables',
        UPDATE_WORLD_POSITIONS: 'gatherables:webview:update-world-positions',
        UPDATE_GATHERABLE: 'gatherables:webview:update-gatherable',
        CLEAR: 'gatherables:webview:clear',
    },
    toClient: {
        ENTER: 'gatherables:client:enter',
        LEAVE: 'gatherables:client:leave',
        PICKUP: 'gatherables:client:pickup',
    },
} as const;
