/*
 * Copyright (c) 2024 Josef Müller.
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { logDebug } from '@/shared/utils/logging.ts';

export const useLoadingStore = defineStore('loading', () => {
    const loading = ref<Record<string, boolean>>({ initial: true });
    const isLoading = computed(() => Object.values(loading.value).some(isLoading => isLoading));
    const isLoadingInitial = computed(() => loading.value.initial);

    function startLoading(key: string) {
        logDebug('startLoading', key);
        loading.value[key] = true;
    }

    function finishLoading(key: string) {
        logDebug('finishLoading', key);
        loading.value[key] = false;
    }

    return {
        loading,
        isLoading,
        isLoadingInitial,
        startLoading,
        finishLoading
    }
});
