<template>
    <h2 class="small-header">
        {{ smallText }}
    </h2>
    <h1 class="big-header">
        {{ bigText[0] }}
        <FancyText v-if="bigText.length > 1" :text="bigText[1]"/>
    </h1>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
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