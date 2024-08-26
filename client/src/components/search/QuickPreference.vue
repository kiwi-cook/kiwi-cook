<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div
        :class="['quick-preference-card', { active: visible && !isButton }, { button: isButton }, { disabled: disabled }]">
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
        type: String,
        required: false
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false
    },
    isButton: {
        type: Boolean,
        required: false,
        default: false
    }
});

const emit = defineEmits(['visible']);

const visible = ref(false);
const toggleContent = () => {
    visible.value = !visible.value;
    if (props.isButton) {
        visible.value = true;
    }
    emit('visible', props.preferenceName, visible.value);
};
</script>

<style scoped>
.quick-preference-card {
    /* Layout */
    padding: var(--padding-small);
    border-radius: var(--border-radius);
    max-width: 100%;
    min-width: 100px;

    /* Colors */
    background-color: var(--ion-background-color);
    border: 1px solid var(--ion-color-medium);
    box-shadow: none;

    /* Animation */
    transition: all 0.3s ease;
}

.quick-preference-card.button {
    transition: none;
}

.quick-preference-card.active, .quick-preference-card:hover, .quick-preference-card:focus, .quick-preference-card:active {
    border-color: var(--ion-color-primary);
}

.quick-preference-card:active, .quick-preference-card.active {
    box-shadow: var(--box-shadow-neumorphism-pressed);
}

.quick-preference-card.active {
    padding: var(--padding-medium);
}

.quick-preference-card.active .quick-preference-title {
    font-weight: 600;
    margin-top: var(--margin-small);
}

.quick-preference-card.active .quick-preferences-content {
    max-height: 80px;
}

.quick-preference-card.disabled {
    opacity: 0.6;
    pointer-events: none;
}

.quick-preference-title {
    cursor: pointer;
    font-weight: 500;
    font-size: var(--font-size-tiny);
    padding-bottom: 2px;
}

.quick-preference-title:hover {
    color: var(--ion-color-primary-shade);
}

.quick-preferences-content {
    padding: 0 var(--padding-small);
    transition: max-height 0.3s ease;
    max-height: 0;
    overflow: hidden;
    font-size: 12px;
}
</style>
