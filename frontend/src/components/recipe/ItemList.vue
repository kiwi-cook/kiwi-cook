<template>
    <div class="item-list-wrapper">
        <ul :class="['item-list', {'horizontal': horizontal}]">
            <template v-for="(item, itemIndex) in mappedItems" :key="itemIndex">
                <li>
                    <IonItem :class="['small-item', {'link': !disableClick}]" lines="none" @click="select(item.id)">
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
import {Item, StepItem} from "@/tastebuddy";
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
    components: {
        IonItem, IonImg, IonText, IonChip
    },
    setup(props: any, {emit}) {
        const {items, type, showLimit, disableClick} = toRefs(props);

        type CustomItem = {
            id: string,
            name: string,
            imgUrl: string,
            amount: number,
            unit: string,
            showAmountUnit: boolean,
            type: string
        }

        const mappedItems = computed(() => items.value.reduce((acc: CustomItem[], item: Item) => {
                if (typeof item === 'undefined' || !type.value.includes(item.type)) {
                    return acc
                }

                const amount = item instanceof StepItem ? item.servingAmount : 0;

                acc.push({
                    id: item.getId(),
                    name: item.getName(),
                    imgUrl: item.imgUrl,
                    amount,
                    unit: item instanceof StepItem ? item.unit : '',
                    showAmountUnit: item.type === 'ingredient' && amount > 0,
                    type: item.type
                })

                return acc
            }, []).slice(0, showLimit.value)
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

.small-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    margin: 0;
    background: inherit !important;
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