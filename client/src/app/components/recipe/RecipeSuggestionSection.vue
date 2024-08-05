<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <section v-if="recipes && recipes.length > 0">
        <h3>
            <slot name="title">
                {{ title }}
            </slot>
        </h3>
        <h4 class="subheader">
            <slot name="subtitle">
                {{ subtitle }}
            </slot>
        </h4>
        <slot name="content">
            <HorizontalList :list="recipes">
                <template #element="{ element }: { element: Recipe}">
                    <MiniRecipePreview :key="element.id" :recipe="element"/>
                </template>
            </HorizontalList>
        </slot>
    </section>
</template>

<script lang="ts" setup>
import { Recipe } from '@/shared';
import HorizontalList from '@/shared/components/utility/list/HorizontalList.vue';
import { MiniRecipePreview } from '@/app/components';
import { PropType } from 'vue';

const props = defineProps({
    title: { type: String, required: false },
    subtitle: { type: String, required: false },
    recipes: { type: Array as PropType<Recipe[]>, required: false }
});
</script>
