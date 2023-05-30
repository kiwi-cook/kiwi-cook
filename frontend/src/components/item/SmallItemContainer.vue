<template>
    <div class="small-item-container">
        <template v-for="(item, itemIndex) in items" :key="itemIndex">
            <SmallItem :item="item" class="small-item"/>
        </template>
    </div>
</template>

<script lang="ts">
import {Item, StepItem} from '@/tastebuddy/types';
import {PropType} from 'vue';
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
    }
};
</script>

<style scoped>
.small-item-container {
    overflow: auto;
    white-space: nowrap;
}

.small-item {
    display: inline-block;
    margin: 0 5px;
}
</style>