<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <ul v-if="ingredients.length > 0" :class="['item-list', {'horizontal': horizontal}]">
        <li v-for="(ingredient, itemIndex) in ingredients" :key="itemIndex" class="item">
            <IngredientComponent :ingredient="ingredient" :quantity-position="quantityPosition"/>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { Ingredient, IngredientComponent, RecipeIngredient } from '@/shared';

const props = defineProps({
    ingredients: {
        type: Array as PropType<(RecipeIngredient[] | Ingredient[])>, required: true,
    }, showLimit: {
        type: Number, required: false, default: 30
    }, horizontal: {
        type: Boolean, required: false, default: false
    }, quantityPosition: {
        type: String as PropType<'start' | 'end'>, required: false, default: 'end'
    }, enableEmit: {
        type: Boolean, required: false, default: false
    }
})
const { ingredients } = toRefs(props);
</script>

<style scoped>
ul.item-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    overflow-y: scroll;
}

ul.item-list.horizontal {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    overflow-x: scroll;
}

li.item {
    margin-right: var(--margin-small);
}
</style>
