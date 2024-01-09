<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <div class="header">
        <h2 class="subheader">
            {{ smallText }}
        </h2>
        <h1 class="big-header">
            {{ bigText[0] }}
            <span v-if="bigText.length > 1" class="header-msg-highlight">{{ bigText[1] }}</span>
        </h1>
    </div>
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

/* Shrink the header on scroll */
const shrinkHeader = () => {
    alert('shrinkHeader')
    const header = document.querySelector('.header');
    const subheader = document.querySelector('.subheader');
    const bigHeader = document.querySelector('.big-header');
    const scrollPosition = window.scrollY;
    if (scrollPosition > 0) {
        header?.classList.add('shrink');
        subheader?.classList.add('shrink');
        bigHeader?.classList.add('shrink');
    } else {
        header?.classList.remove('shrink');
        subheader?.classList.remove('shrink');
        bigHeader?.classList.remove('shrink');
    }
};
</script>

<style>
.header {
    padding-top: var(--padding-t);
}
</style>

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

.shrink {
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-normal);
    margin: 0 0 5px;
}
</style>