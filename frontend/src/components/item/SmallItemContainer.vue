<template>
    <div class="small-item-container">
        <template v-for="(item, itemIndex) in internalItems" :key="itemIndex">
            <SmallItem :item="item" class="small-item" />
        </template>
    </div>
</template>

<script lang="ts">
import { Item, StepItem } from '@/api/types';
import { computed, ComputedRef, PropType, toRefs } from 'vue';
import SmallItem from '@/components/item/SmallItem.vue';

export default {
    name: 'SmallItemContainer',
    props: {
        items: {
            type: Array as PropType<(StepItem[] | Item[])>,
            required: true,
        },
    },
    components: {
        SmallItem,
    },
    setup(props: any) {
        const { items } = toRefs(props);

        const internalItems: ComputedRef<Item[]> = computed(() => items.value?.map((stepItem: StepItem | Item) => stepItem instanceof StepItem ? stepItem.item : stepItem))

        return {
            internalItems
        };
    },
};
</script>

<style scoped>
.small-item-container {
    display: flex;
    flex-direction: row;
}
</style>