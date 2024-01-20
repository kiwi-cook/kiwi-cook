<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div :class="['quick-preference-card', {active: visible && !isButton}, {button: isButton}, {disabled: disabled}]">
        <div class="quick-preference-title" @click="toggleContent()">
            <slot name="title"/>
        </div>
        <div class="quick-preferences-content">
            <Transition name="fade-top">
                <slot v-if="visible && !isButton" name="default"/>
            </Transition>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps({
    preferenceName: {
        type: String, required: false
    }, disabled: {
        type: Boolean, required: false, default: false
    }, isButton: {
        type: Boolean, required: false, default: false
    }
})

const emit = defineEmits({
    'visible': (preferenceName, visible) => ({
        preferenceName: preferenceName, visible: visible
    })
})

const visible = ref(false)
const toggleContent = () => {
    visible.value = !visible.value
    if (props.isButton) {
        visible.value = true
    }
    emit('visible', props.preferenceName, visible.value)
}
</script>

<style scoped>
.quick-preference-card {
    /* Layout */
    margin-bottom: 20px;
    padding: 10px;
    border-radius: var(--border-radius-strong);
    max-width: 100%;
    min-width: 150px;

    /* Colors */
    background-color: var(--ion-background-color);

    overflow: hidden;

    /* Animation + Shadow */
    transition: var(--transition);
    border: var(--border);
    border-color: var(--ion-color-primary);

    z-index: 500;
}

.quick-preference-card.button {
    transition: none;
}

.quick-preference-card:active, .quick-preference-card.active {
    box-shadow: var(--box-shadow-neumorphism-pressed);
}

.quick-preference-card.active {
    max-height: 100%;
    border-radius: var(--border-radius);
}

.quick-preference-card.active .quick-preferences-content {
    max-height: 200px;
}

.quick-preference-card.disabled {
    opacity: 0.5;
    pointer-events: none;
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
