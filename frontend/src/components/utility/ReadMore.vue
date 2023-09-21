<template>
    {{ computedText }}
    <a class="read-more-button" @click="isExpanded = !isExpanded">
        {{ isExpanded ? 'Read less' : 'Read more' }}
    </a>
</template>

<script setup lang="ts">
import {computed, ref, toRefs} from 'vue';

const props = defineProps({
    text: {
        type: String,
        required: true,
    },
    maxLength: {
        type: Number,
        required: false,
        default: 100,
    },
})
const {text, maxLength} = toRefs(props);
const isExpanded = ref(false);

const computedText = computed(() => {
    if (isExpanded.value) {
        return text.value;
    } else {
        return text.value.substring(0, maxLength.value) + '...';
    }
});

</script>

<style scoped>
.read-more-button {
    margin-left: 8px;
    color: var(--ion-color-primary);
    cursor: pointer;
    font-size: var(--font-size-small);
    font-weight: bold;
}
</style>