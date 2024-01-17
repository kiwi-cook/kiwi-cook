<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div :class="['smart-question-card', {'no-animation': noAnimation}]" @mouseenter="showContent()"
         @mouseleave="hideContent()">
        <h4 class="smart-question-header">{{ title }}</h4>
        <div :class="['smart-question-subtitle', {'big': !visible || noAnimation}]">
            <slot name="subtitle"/>
        </div>
        <Transition name="fade-top">
            <div v-show="visible" class="item">
                <slot name="default"/>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import {ref} from 'vue';

defineProps({
    title: {
        type: String, required: true
    },
    noAnimation: {
        type: Boolean, required: false, default: false
    }
})

const visible = ref(false)
const showContent = () => visible.value = true
const hideContent = () => visible.value = false
</script>

<style scoped>
.smart-question-card {
    max-width: 100%;
    border-radius: var(--border-radius);
    border: var(--border);
    box-shadow: var(--box-shadow2);
    transition: var(--transition);
    cursor: pointer;
    overflow: hidden;
}

.smart-question-card.no-animation {
    transition: none;
}

.smart-question-header {
    padding: var(--padding);
    margin-bottom: 0;
    font-size: var(--font-size-medium);
}

.smart-question-subtitle {
    font-size: var(--font-size-smaller);
    font-weight: var(--font-weight-normal);
    margin-top: 5px;
    margin-bottom: 0;
    color: var(--ion-color-medium);
    line-height: 1.4;
    transition: var(--transition);
}

.smart-question-subtitle.big {
    margin-top: 0;
    font-size: var(--font-size-small);
    line-height: 1.4;
}

.item {
    padding: 0 var(--margin);
    border: none;
    transition: var(--transition);
}

/* Add additional styles as needed to match the Ionic look and feel */
</style>
