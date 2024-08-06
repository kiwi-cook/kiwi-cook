<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div class="searchbar-container">
        <div :class="{ 'searchbar-wrapper--active': isActive }" class="searchbar-wrapper">
            <input ref="searchbarInput" v-model.trim="input"
                   :placeholder="$t('Suggestions.SearchbarPrompt')" class="searchbar-input"
                   @focus="onFocus()" @keyup.enter="search()"/>
            <button :class="{ disabled: !input }" class="searchbar-button search" @click="search()">
                <IonIcon :icon="searchOutline"/>
            </button>
            <button :class="{ disabled: true }" class="searchbar-button camera" title="Not implemented yet"
                    @click="camera()">
                <IonIcon :icon="cameraOutline"/>
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { IonIcon } from '@ionic/vue';
import { ref } from 'vue';
import { cameraOutline, searchOutline } from 'ionicons/icons';

const input = defineModel('input', { type: String, required: true });
const emit = defineEmits(['onFocus', 'onClose', 'search']);

const onFocus = () => emit('onFocus');
const search = () => emit('search');
const camera = () => console.log('Camera button clicked');

const searchbarInput = ref<HTMLInputElement | null>(null);
const isActive = ref(false);
</script>

<style scoped>
.searchbar-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: flex-start;
    align-items: flex-start;
    margin: var(--margin) 0;
    width: 100%;
    max-width: 860px;
}

.searchbar-wrapper {
    min-width: fit-content;
    max-width: 420px;
    height: 50px;
    position: relative;
    z-index: 1;
    display: flex;
    gap: 10px;
    align-items: center;
    border: var(--border);
    border-color: var(--ion-color-primary);
    border-radius: var(--border-radius-strong);
    padding: 5px 10px;
    box-shadow: var(--box-shadow-neumorphism);
    background-color: rgba(var(--ion-background-color-rgb), 0.9);
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    transition: var(--transition);
}

@media (max-width: 860px) {
    .searchbar-wrapper {
        width: 100%;
        max-width: 420px;
    }
}

@media (max-width: 480px) {
    .searchbar-wrapper {
        min-width: 0;
    }
}

.searchbar-input {
    border: none;
    outline: none;
    font-size: 16px;
    padding: 10px;
    border-radius: var(--border-radius-strong);
    background: none;
    cursor: pointer;
    color: var(--ion-text-color);
    flex-grow: 1;
    min-width: 0;
    width: 250px;
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
}

.searchbar-button.search {
    background: radial-gradient(circle at top left, #ffc718, #c362b5, #6ab1e1);
}

.searchbar-button.camera {
    background: radial-gradient(circle at top left, #ff7e5f, #feb47b, #ffcb80);
}

.searchbar-button.disabled {
    opacity: 0.5;
    pointer-events: none;
    background: none;
    color: inherit;
    box-shadow: none;
    border: thin solid var(--ion-color-primary);
}

.searchbar-button:hover, .searchbar-button:active {
    scale: 1.05;
}

@media (max-width: 900px) {
    .searchbar-container {
        flex-direction: column;
        align-items: center;
    }
}
</style>
