<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <QuickPreference>
        <template #title>
            <span class="highlight">{{
                selectedItems.length
            }} Zutaten</span> ausgewählt
        </template>
        <template #default>
            <HorizontalList :list="selectedItems" no-wrap>
                <template #element="{element}">
                    {{ element }}
                </template>
            </HorizontalList>
        </template>
    </QuickPreference>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { HorizontalList } from '@/shared';
import QuickPreference from '@/app/components/search/QuickPreference.vue';

const itemSelectionMap = ref(new Map<string, boolean>());
itemSelectionMap.value.set('Apfel', true);
itemSelectionMap.value.set('Birne', true);
itemSelectionMap.value.set('Banane', true);
itemSelectionMap.value.set('Kiwi', false);

const selectedItems = computed<string[]>(() => Array.from(itemSelectionMap.value.keys())
    .filter(key => itemSelectionMap.value.get(key) ?? false));
</script>