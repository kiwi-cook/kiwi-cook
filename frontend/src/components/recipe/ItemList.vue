<template>
    <div class="item-list-wrapper">
        <ul class="item-list">
            <template v-for="(item, itemIndex) in mappedItems" :key="itemIndex">
                <li>
                    <IonItem class="small-item" lines="none" @click="select(item.id)">
                        <IonImg :src="item.imgUrl ?? ''" class="small-item-img"/>
                        <IonText class="small-item-name">
                            <IonChip v-if="item.showAmountUnit">
                                {{ item.amount }} {{ item.unit }}
                            </IonChip>
                            {{ item.name }}
                        </IonText>
                    </IonItem>
                </li>
            </template>
        </ul>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Item, StepItem} from "@/tastebuddy/types";
import {IonChip, IonImg, IonItem, IonText} from "@ionic/vue";

export default defineComponent({
    name: 'ItemList',
    props: {
        items: {
            type: Array as PropType<(StepItem[] | Item[])>,
            required: true,
        },
        showLimit: {
            type: Number,
            required: false,
            default: 5
        },
        type: {
            type: Array as PropType<string[]>,
            required: false,
            default: () => ['ingredient', 'tool']
        }
    },
    emits: ['select'],
    components: {
        IonItem, IonImg, IonText, IonChip
    },
    setup(props: any, {emit}) {
        const {items, type, showLimit} = toRefs(props);

        const mappedItems = computed(() => items.value
            .map((item: Item) => {
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
            })
            .filter((item: any) => (type.value as string[]).includes(item.type))
            .slice(0, showLimit.value)
        );

        const select = (itemId: string) => {
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