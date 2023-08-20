<template>
    <h2 class="small-header">
        {{ smallText }}
    </h2>
    <h1 class="big-header">
        {{ bigText[0] }}
        <FancyText v-if="bigText.length > 1" :text="typedText"/>
    </h1>
</template>

<script lang="ts">
import {defineComponent, onMounted, PropType, Ref, ref, toRefs} from "vue";
import FancyText from "@/components/utility/fancy/FancyText.vue";

export default defineComponent({
    name: 'FancyHeader',
    components: {FancyText},
    props: {
        smallText: {
            type: String,
            required: false
        },
        bigText: {
            type: Object as PropType<string[]>,
            required: true
        }
    },
    setup(props: { bigText: string[] }) {
        const { bigText} = toRefs(props);

        let interval = -1
        const typedText = ref('')
        const typedTextIndex = ref(0)
        const typeText = (text: string, typedText: Ref<string>, typedTextIndex: Ref<number>): boolean => {
            if (text.length <= typedTextIndex.value) {
                return false
            }
            typedText.value += text[typedTextIndex.value++]
            return true
        }

        onMounted(() => {
            interval = setInterval(() => {
                if (!typeText(bigText.value[1] ?? '', typedText, typedTextIndex)) {
                    clearInterval(interval)
                }
            }, 150)
        })

        return {
            typedText
        }
    }
})
</script>

<style scoped>
.small-header {
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-normal);
    margin-bottom: 0;
    margin-left: 0;
    color: var(--ion-color-dark);
}

.big-header {
    margin-top: 0;
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-bold);
    margin-bottom: 10px;
    margin-left: 0;
}
</style>