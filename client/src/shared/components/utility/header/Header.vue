<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <h2 class="subheader">
        {{ smallText }}
    </h2>
    <h1 class="big-header">
        {{ bigText[0] }}
        <span v-if="bigText.length > 1" class="header-msg-highlight">{{ bigText[1] }}</span>
    </h1>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
    smallText: {
        type: String, required: false
    }, bigText: {
        type: Object as PropType<string[]>, required: true
    }
})
</script>

<style scoped>
.header-msg-highlight {
    color: var(--ion-color-primary);
    font-weight: var(--font-weight-bolder);
}

.big-header {
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-bold);
    margin: 0 0 10px;
}

</style>