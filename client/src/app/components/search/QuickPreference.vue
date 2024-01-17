<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div :class="['quick-preference-card', {'active': visible}]">
        <div class="quick-preference-title" @click="toggleContent()">
            <slot name="title"/>
        </div>
        <div class="quick-preferences-content">
            <slot name="default"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const visible = ref(false)
const toggleContent = () => visible.value = !visible.value
</script>

<style scoped>
.quick-preference-card {
    /* Layout */
    margin-bottom: 20px;
    padding: 10px;
    border-radius: var(--border-radius);
    max-width: 100%;
    min-width: 200px;

    /* Colors */
    background-color: var(--ion-background-color);

    overflow: hidden;

    /* Animation + Shadow */
    transition: var(--transition);
    border: var(--border);
    border-color: var(--ion-color-primary);

    z-index: 500;
}

.quick-preference-card.active {
    box-shadow: var(--box-shadow-neumorphism-pressed);
}

.quick-preference-card.active .quick-preferences-content {
    max-height: 200px;
}

.quick-preference-title {
    cursor: pointer;
}

.quick-preference-title:hover {
    text-decoration: underline;
    text-decoration-color: var(--ion-color-primary);
    text-decoration-thickness: 2px;
}

.quick-preferences-content {
    padding: 0 var(--margin);
    border: none;
    transition: var(--transition);
    max-height: 0;
}
</style>
