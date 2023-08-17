<template>
    <h1>
        {{ header[0] }}
        <FancyText v-if="header.length > 1" :text="header[1]"/>
    </h1>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import FancyText from "@/components/utility/fancy/FancyText.vue";

export default defineComponent({
    name: 'FancyHeader',
    components: {FancyText},
    props: {
        header: {
            type: Object as PropType<string[]>,
            required: true
        }
    },
})
</script>
