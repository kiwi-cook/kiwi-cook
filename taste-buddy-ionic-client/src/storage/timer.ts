/*
 * Copyright (c) 2024 Josef Müller.
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { logDebug } from '@/shared/utils/logging.ts';
import { presentToast } from '@/shared';

const MODULE = 'store.useTimer.';

export const useTimerStore = defineStore('timer', () => {
    const _timers = ref<{ [timerKey: string]: { time: number; remaining: number; timerInterval: any } }>({});

    const numberOfTimers = computed(() => Object.keys(_timers.value).length);

    const timers = computed(() =>
        Object.keys(_timers.value).map(timerKey => ({
            key: timerKey,
            time: _timers.value[timerKey].time,
            remaining: _timers.value[timerKey].remaining,
            timeAsString: timeAsString(timerKey)
        }))
    );

    const startTimer = (duration: number, timerKey?: string) => {
        if (duration <= 0 || !timerKey) {
            return Promise.resolve();
        }

        // Stop the existing timer if it is already running
        if (_timers.value[timerKey]) {
            stopTimer(timerKey);
        }

        _timers.value[timerKey] = {
            time: duration,
            remaining: duration,
            timerInterval: null
        };

        // Start the timer
        _timers.value[timerKey].timerInterval = setInterval(() => {
            if (_timers.value[timerKey]) {
                _timers.value[timerKey].remaining -= 1;
                if (_timers.value[timerKey].remaining <= 0) {
                    stopTimer(timerKey);
                    presentToast('Timer finished', false, 3000);
                }
            }
        }, 1000);

        logDebug(MODULE + 'startTimer', timerKey, duration, timers.value);
        return Promise.resolve();
    };

    const stopTimer = (timerKey: string) => {
        if (!_timers.value[timerKey]) {
            return;
        }

        if (_timers.value[timerKey].timerInterval !== null) {
            clearInterval(_timers.value[timerKey].timerInterval);
        }
        delete _timers.value[timerKey];
        logDebug(MODULE + 'stopTimer', timerKey);
    };

    const resetTimer = (timerKey: string) => {
        if (!_timers.value[timerKey]) {
            return;
        }

        _timers.value[timerKey].remaining = _timers.value[timerKey].time;
    };

    const getTimer = (timerKey: string) => {
        return _timers.value[timerKey];
    };

    const pad = (n: number) => (n < 10 ? `0${n}` : n);

    const timeAsString = (timerKey: string) => {
        const remaining = _timers.value[timerKey]?.remaining;
        if (!remaining) {
            return '00:00:00';
        }

        const h = Math.floor(remaining / 3600);
        const m = Math.floor(remaining / 60) - h * 60;
        const s = Math.floor(remaining - h * 3600 - m * 60);

        let time = '';
        if (h > 0) {
            time += `${pad(h)}:`;
        }
        time += `${pad(m)}:${pad(s)}`;

        return time;
    };

    return {
        startTimer,
        stopTimer,
        resetTimer,
        getTimer,
        timers,
        numberOfTimers
    };
});
