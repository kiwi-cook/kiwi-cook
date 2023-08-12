<template>
    <div class="item-list-wrapper">
        <ul :class="['item-list', {'horizontal': horizontal}]">
            <template v-for="(item, itemIndex) in mappedItems" :key="itemIndex">
                <li>
                    <ItemComponent :item="item" :disableClick="disableClick" @select="select($event)"/>
                </li>
            </template>
        </ul>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Item, StepItem} from "@/tastebuddy";
import ItemComponent from "@/components/recipe/Item.vue";

export default defineComponent({
    name: 'ItemList',
    components: {ItemComponent},
    props: {
        items: {
            type: Array as PropType<(StepItem[] | Item[])>,
            required: true,
        },
        showLimit: {
            type: Number,
            required: false,
            default: 30
        },
        type: {
            type: Array as PropType<string[]>,
            required: false,
            default: () => ['ingredient', 'tool']
        },
        horizontal: {
            type: Boolean,
            required: false,
            default: false
        },
        disableClick: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    emits: ['select'],
    setup(props: any, {emit}) {
        const {items, type, showLimit, disableClick} = toRefs(props);

        const mappedItems = computed<Item[]>(() => items.value
            .slice(0, showLimit.value)
            .filter((item: Item) => type.value.includes(item.type))
        )

        const select = (itemId: string) => {
            if (disableClick.value) {
                return;
            }
            emit('select', itemId)
        }

        return {
            mappedItems, select
        }
    }
})
</script>

<style scoped>
.item-list-wrapper {
    max-height: 40vh;
    overflow-y: scroll;
}

ul.item-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

ul.item-list.horizontal {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
}
</style>