/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { defineStore } from 'pinia';

interface TasteBuddyAppState {
    timer: {
        recipeId?: string, time: number, remaining: number, timerInterval: number | null
    } | null
}

export const useAppStore = defineStore('tastebuddy-app', {
    state: (): TasteBuddyAppState => ({
        timer: null
    }), actions: {
        /**
         * Set step timer for a recipe
         * @param time in minutes
         * @param recipeId
         */
        async setTimer(time?: number, recipeId?: string) {
            // If no time is given, return immediately
            if (!time) {
                return Promise.resolve()
            }

            // Stop the timer if it is already running
            if (this.timer !== null) {
                await this.stopTimer()
            }

            this.timer = {
                recipeId: recipeId, time: time * 60, remaining: time * 60, timerInterval: null
            }

            // Start the timer
            this.timer.timerInterval = setInterval(() => {
                if (this.timer !== null) {
                    this.timer.remaining -= 1
                } else {
                    const audio = new Audio('/assets/audio/timer.mp3');
                    audio.play();
                    this.stopTimer()
                }
            }, 1000)
        }, async resetTimer() {
            if (this.timer === null) {
                return
            }
            this.timer.remaining = this.timer.time
        }, async stopTimer() {
            if (this.timer === null) {
                return
            }
            if (this.timer.timerInterval !== null) {
                clearInterval(this.timer.timerInterval)
            }
            this.timer = null
        },
    }
})
