<template>
    <h1>
        {{ header[0] }} <span v-if="header.length > 1"
                              class="header-msg-highlight">{{ header[1] }}</span>
    </h1>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";

export default defineComponent({
    name: 'FancyHeader',
    props: {
        header: {
            type: Object as PropType<string[]>,
            required: true
        }
    },
})
</script>

<style scoped>
.header-msg-highlight {
    color: var(--ion-color-primary);
}
</style>