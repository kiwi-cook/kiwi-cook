<template>
    <h2 class="subheader">
        {{ smallText }}
    </h2>
    <h1 class="big-header">
        {{ bigText[0] }}
        <span v-if="bigText.length > 1" class="header-msg-highlight">{{ typedText }}</span>
    </h1>
</template>

<script lang="ts" setup>
import {PropType, Ref, ref, toRefs, watch} from "vue";

const props = defineProps({
    smallText: {
        type: String,
        required: false
    },
    bigText: {
        type: Object as PropType<string[]>,
        required: true
    }
})
const {bigText} = toRefs(props);

let interval = -1
const typedText = ref('')
const typedTextIndex = ref(0)
const typeText = (text: string, typedText: Ref<string>, typedTextIndex: Ref<number>): boolean => {
    if (text.length <= typedTextIndex.value) {
        return false
    }
    typedText.value += text.charAt(typedTextIndex.value++)
    return true
}

const startTyping = () => {
    if (interval !== -1) {
        clearInterval(interval)
    }
    interval = setInterval(() => {
        if (!typeText(bigText.value[1] ?? '', typedText, typedTextIndex)) {
            clearInterval(interval)
        }
    }, 150)
}
watch(bigText, startTyping)
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