<template>
    <IonItem v-if="mappedItem" :button="!disableClick" class="item" :lines="lines" @click="select">
        <div class="item-start">
            <IonImg v-if="!mappedItem.showAmountUnit && mappedItem.imgUrl" :src="mappedItem.imgUrl ?? ''"
                    class="item-img-rm"/>
            <IonText class="item-name" :color="color">
                <IonChip v-if="mappedItem.showAmountUnit">
                    {{ mappedItem.amount }} {{ mappedItem.unit }}
                    <IonImg v-if="mappedItem.imgUrl" :src="mappedItem.imgUrl ?? ''"
                            class="item-img-lm"/>
                </IonChip>
                {{ mappedItem.name }}
            </IonText>
        </div>
        <div class="item-end">
            <slot name="end"></slot>
        </div>
    </IonItem>
</template>

<script lang="ts">
import {IonChip, IonImg, IonItem, IonText} from "@ionic/vue";
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Item, StepItem} from "@/tastebuddy";

export default defineComponent({
    name: 'Item',
    props: {
        item: {
            type: Object as PropType<(StepItem | Item)>,
            required: true,
        },
        disableClick: {
            type: Boolean,
            required: false,
            default: false
        },
        color: {
            type: String,
            required: false,
            default: ''
        },
        lines: {
            type: String as PropType<"full" | "inset" | "none" | undefined>,
            required: false,
            default: 'none'
        }
    },
    emits: ['select'],
    components: {
        IonItem, IonImg, IonText, IonChip
    },
    setup(props: any, {emit}) {
        const {item} = toRefs(props);

        type CustomItem = {
            id: string,
            name: string,
            amount: number,
            unit: string,
            imgUrl: string,
            showAmountUnit: boolean
        }

        const mappedItem = computed<CustomItem | undefined>(() => {
            if (!item.value) {
                return undefined;
            }
            const amount = item.value instanceof StepItem ? item.value.servingAmount : 0;

            return {
                id: item.value.getId(),
                name: item.value.getName(),
                imgUrl: item.value.imgUrl,
                amount,
                unit: item.value instanceof StepItem ? item.value.unit : '',
                showAmountUnit: item.value.type === 'ingredient' && amount > 0,
                type: item.value.type
            }
        })

        const select = () => {
            if (mappedItem.value && !props.disableClick) {
                emit('select', mappedItem.value.id)
            }
        }

        return {
            mappedItem,
            select
        }
    }
})
</script>

<style scoped>
.item {
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: space-between;
    background: inherit !important;
}

.item::part(native) {
    margin: 5px 0;
    padding: 0;
    min-width: 230px;
}

ion-item.border::part(native) {
    border: var(--border);
    border-radius: 15px;
}

.item-img-rm::part(image) {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
}

.item-img-lm::part(image) {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-left: 10px;
}

.item-name {
    font-size: 1rem;
    margin: 0;
}

.item-start, .item-end {
    display: flex;
}

.item-start {
    margin-right: auto;
}

.item-end {
    margin-left: auto;
}
</style>