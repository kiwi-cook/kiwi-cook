<template>
    <IonItem v-if="mappedItem" :class="['item', {'button':!disableClick}]" lines="none" @click="select">
        <div class="item-start">
            <IonImg v-if="!mappedItem.showAmountUnit && mappedItem.imgUrl" :src="mappedItem.imgUrl ?? ''"
                    class="item-img-rm"/>
            <IonText class="item-name">
                <IonChip v-if="mappedItem.showAmountUnit">
                    {{ mappedItem.quantity}} {{ mappedItem.unit }}
                    <IonImg v-if="mappedItem.imgUrl" :src="mappedItem.imgUrl ?? ''"
                            class="item-img-lm"/>
                </IonChip>
                <span :class="[{'item-excluded': include === false}]">
                    {{ mappedItem.name }}
                    <span v-if="include" class="item-included">✓</span>
                </span>
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
        include: {
            type: Boolean,
            required: false,
            default: undefined
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
            quantity: number,
            unit: string,
            imgUrl: string,
            showAmountUnit: boolean
        }

        const mappedItem = computed<CustomItem | undefined>(() => {
            if (!item.value) {
                return undefined;
            }
            const quantity= item.value instanceof StepItem ? item.value.servingAmount : 0;

            return {
                id: item.value.getId(),
                name: item.value.getName(),
                imgUrl: item.value.imgUrl,
                quantity,
                unit: item.value instanceof StepItem ? item.value.unit : '',
                showAmountUnit: item.value.type === 'ingredient' && quantity> 0,
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
ion-item.item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    background: inherit !important;
}

ion-item.item::part(native) {
    padding: 0;
    min-width: 230px;
}

.item.button {
    cursor: pointer;
}

.item-img-rm::part(image) {
    width: 30px;
    height: 30px;
    border-radius: var(--border-radius-round);
    margin-right: 10px;
}

.item-img-lm::part(image) {
    width: 30px;
    height: 30px;
    border-radius: var(--border-radius-round);
    margin-left: 10px;
}

.item-name {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-normal);
    margin: 0;
}

.item-excluded {
    text-decoration: line-through;
    text-decoration-thickness: 0.15rem;
    text-decoration-color: var(--ion-color-danger);
}

.item-included {
    color: var(--ion-color-success);
    margin-left: 0.5rem;
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