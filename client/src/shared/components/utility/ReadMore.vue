<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    {{ readMore.text }}
    <span v-if="readMore.showButton" class="read-more-button" @click="isExpanded = !isExpanded">
        {{ isExpanded ? $t('General.ReadLess') : $t('General.ReadMore') }}
    </span>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue';

const props = defineProps({
    text: {
        type: String, required: true,
    }, length: {
        type: Number, required: false, default: 2,
    },
})
const {text, length} = toRefs(props);
const isExpanded = ref(false);

/**
 * Get the nth occurrence of a string in a string
 * @author kennebec at https://stackoverflow.com/a/14482123
 *
 * @param str
 * @param pat
 * @param n
 */
const nthIndex = (str: string, pat: string, n: number) => {
    const L = str.length
    let i = -1
    while (n-- && i++ < L) {
        i = str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}

const readMore = computed<{ text: string, showButton: boolean }>(() => {
    if (!text?.value) {
        return {text: '', showButton: false};
    }

    const index = nthIndex(text.value, '.', length?.value);
    if (index === -1 || text.value.length <= index + 1) {
        return {text: text.value, showButton: false};
    } else {
        return {text: isExpanded.value ? text.value : text.value.substring(0, index + 1), showButton: true};
    }
});

</script>

<style>
.read-more-button {
    margin-left: 4px;
    color: var(--ion-color-primary);
    cursor: pointer;
    text-decoration: underline;
    font-weight: var(--font-weight-bold);
}
</style>