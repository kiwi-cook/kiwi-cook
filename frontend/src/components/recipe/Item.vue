<template>
    <IonItem v-if="mappedItem" :button="!disableClick"
             :class="['small-item', {'border': border}]" lines="none" @click="select">
        <IonImg v-if="!mappedItem.showAmountUnit && mappedItem.imgUrl" :src="mappedItem.imgUrl ?? ''"
                class="small-item-img-rm"/>
        <IonText class="small-item-name" :color="color">
            <IonChip v-if="mappedItem.showAmountUnit">
                {{ mappedItem.amount }} {{ mappedItem.unit }}
                <IonImg v-if="mappedItem.imgUrl" :src="mappedItem.imgUrl ?? ''"
                        class="small-item-img-lm"/>
            </IonChip>
            {{ mappedItem.name }}
        </IonText>
        <div slot="end" class="item-buttons">
            <slot name="buttons"></slot>
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
        border: {
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
.small-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background: inherit !important;
}

ion-item.border::part(native) {
    border: var(--border);
    border-radius: 15px;
}

.small-item-img-rm::part(image) {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
}

.small-item-img-lm::part(image) {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-left: 10px;
}

.small-item-name {
    font-size: 1rem;
    margin: 0;
}

.item-buttons {
    margin-left: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    z-index: 100;
}

</style>