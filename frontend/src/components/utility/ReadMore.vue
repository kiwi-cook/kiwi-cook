<template>
    {{ computedText }}
    <a v-if="showButton" class="read-more-button" @click="isExpanded = !isExpanded">
        {{ isExpanded ? 'Read less' : '...Read more' }}
    </a>
</template>

<script setup lang="ts">
import {computed, ref, toRefs} from 'vue';

const props = defineProps({
    text: {
        type: String,
        required: true,
    },
    length: {
        type: Number,
        required: false,
        default: 2,
    },
})
const {text, length} = toRefs(props);
const isExpanded = ref(false);

const showButton = computed(() => text.value.length > length.value)

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

const computedText = computed(() => {
    if (isExpanded.value || text.value.length <= length.value) {
        return text.value;
    } else {
        const index = nthIndex(text.value, '.', length.value);
        return text.value.substring(0, index + 1);
    }
});

</script>

<style>
.read-more-button {
    margin-left: 4px;
    color: var(--ion-color-primary);
    cursor: pointer;
    font-weight: var(--font-weight-bold);
}
</style>