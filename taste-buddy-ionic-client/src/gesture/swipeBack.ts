/*
 * Copyright (c) 2024 Josef Müller.
 */

import { createGesture } from '@ionic/core';

export const DisableSwipeBackDirective = {
    beforeMount(el: HTMLElement) {
        const gesture = createGesture({
            el,
            threshold: 0,
            gestureName: 'goback-swipe',
            gesturePriority: 40.5,
            onMove: () => console.log('onMove'),
        });
        gesture.enable(true);
    }
};
