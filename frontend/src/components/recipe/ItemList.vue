<template>
    <ul>
        <template v-for="(item, itemIndex) in mappedItems" :key="itemIndex">
            <li>
                <ion-item class="small-item" lines="none" @click="select(item.id)">
                    <ion-img :src="item.imgUrl ?? ''" class="small-item-img" />
                    <ion-text class="small-item-name">
                        <ion-chip v-if="item.showAmountUnit" color="light">
                            {{ item.amount }} {{ item.unit }}</ion-chip>{{ item.name }}
                    </ion-text>
                </ion-item>
            </li>
        </template>
    </ul>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from "vue";
import { Item, StepItem } from "@/tastebuddy/types";
import { IonItem, IonImg, IonText, IonChip } from "@ionic/vue";

export default defineComponent({
    name: 'ItemList',
    props: {
        items: {
            type: Array as PropType<(StepItem[] | Item[])>,
            required: true,
        },
    },
    emits: ['select'],
    components: {
        IonItem, IonImg, IonText, IonChip
    },
    setup (props: any, { emit }) {
        const { items } = toRefs(props);
        const mappedItems = computed(() => items.value.map((item: Item) => {
            const amount = item instanceof StepItem ? item.servingAmount : 0;
            return {
                id: item.getId(),
                name: item.name,
                imgUrl: item.imgUrl,
                amount,
                unit: item instanceof StepItem ? item.unit : '',
                showAmountUnit: item.type === 'ingredient' && amount > 0,
                type: item.type
            }
        }))

        const select = (itemId: string) => {
            emit('select', itemId)
        }

        return {
            mappedItems,
            select
        }
    }
})
</script>

<style scoped>
ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.small-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    margin: 0;
    background: inherit !important;
    cursor: pointer;
}

.small-item-img::part(image) {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
}

ion-text.small-item-name {
    font-size: 1rem;
    margin: 0;
}
</style>