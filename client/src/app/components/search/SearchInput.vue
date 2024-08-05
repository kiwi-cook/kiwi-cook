<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div :class="{ active: isActive }" class="searchbar-search-wrapper">
        <input ref="searchbarInput" v-model.trim="input"
               :placeholder="$t('Suggestions.SearchbarPrompt')" class="searchbar-search"
               @focus="onFocus" @keyup.enter="search"/>
        <button class="searchbar-button search" @click="search">
            <IonIcon :icon="searchIcon"/>
        </button>
    </div>
</template>

<script lang="ts" setup>
import { searchOutline as searchIcon } from 'ionicons/icons';
import { IonIcon } from '@ionic/vue';
import { ref } from 'vue';

const input = defineModel('input', { type: String, required: true });
const emit = defineEmits(['onFocus', 'onClose', 'search']);

const onFocus = () => emit('onFocus');
const search = () => emit('search');

const searchbarInput = ref<HTMLInputElement | null>(null);
const isActive = ref(false);
</script>


<style scoped>
.searchbar-search-wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 10px; /* Space between input and button */
    align-items: center;
    border: var(--border);
    border-color: var(--ion-color-primary);
    border-radius: var(--border-radius-strong);
    padding: 5px 10px;
    margin: var(--margin) 0;
    box-shadow: var(--box-shadow-neumorphism);
    background-color: rgba(var(--ion-background-color-rgb), 0.9);
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    transition: var(--transition);
    max-width: 400px;
    width: 100%;
}

.searchbar-search-wrapper.active {
    box-shadow: var(--box-shadow-neumorphism-pressed);
}

.searchbar-search {
    border: none;
    outline: none;
    font-size: 16px;
    padding: 10px;
    border-radius: var(--border-radius-strong);
    background: none;
    cursor: pointer;
    color: var(--ion-text-color);
    flex-grow: 1; /* Allow input to take up remaining space */
    min-width: 0; /* Ensure the input does not overflow */
}

.searchbar-button {
    display: inline-block;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: var(--font-weight-bold);
    text-align: center;
    text-decoration: none;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    color: #fff;
    background-size: 200% 200%;
    box-shadow: var(--box-shadow);
    transition: background 1s ease-in-out, transform ease-in-out 300ms, box-shadow ease-in-out 300ms, scale ease-in-out 300ms;
    background: radial-gradient(circle at top left, #ffc718, #c362b5, #6ab1e1);
}

.searchbar-button.search {
    background: radial-gradient(circle at top left, #ffc718, #c362b5, #6ab1e1);
}

.searchbar-button.disabled {
    opacity: 0.5;
    pointer-events: none;
    background: none;
    color: inherit;
    border: none;
    box-shadow: none;
}

.searchbar-button:hover, .searchbar-button:active {
    scale: 1.05;
}
</style>
