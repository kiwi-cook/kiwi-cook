<template>
    <ul>
        <template v-for="(item, itemIndex) in items" :key="itemIndex">
            <li>
                <SmallItem :item="item" class="small-item" />
            </li>
        </template>
    </ul>
</template>

<script lang="ts">
import SmallItem from "@/components/item/SmallItem.vue";
import { defineComponent, PropType } from "vue";
import { Item, StepItem } from "@/tastebuddy/types";

export default defineComponent({
    name: 'SmallItemList',
    props: {
        items: {
            type: Array as PropType<(StepItem[] | Item[])>,
            required: true,
        },
    },
    components: {
        SmallItem,
    }
})
</script>

<style scoped>
ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}
</style>