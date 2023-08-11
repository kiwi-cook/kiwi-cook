<template>
    <IonItem :class="['small-item', {'link': !disableClick}]" lines="none" @click="select(customItem.id)">
        <IonImg v-if="!customItem.showAmountUnit && customItem.imgUrl" :src="customItem.imgUrl ?? ''"
                class="small-item-img-rm"/>
        <IonText class="small-item-name">
            <IonChip v-if="customItem.showAmountUnit">
                {{ customItem.amount }} {{ customItem.unit }}
                <IonImg v-if="customItem.imgUrl" :src="customItem.imgUrl ?? ''"
                        class="small-item-img-lm"/>
            </IonChip>
            {{ customItem.name }}
        </IonText>
    </IonItem>
</template>

<script lang="ts">
import {IonChip, IonImg, IonItem, IonText} from "@ionic/vue";
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Item, logDebug, StepItem} from "@/tastebuddy";

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

        const customItem = computed<CustomItem>(() => ({
            id: item.value._id,
            name: item.value.name,
            amount: item.value.amount,
            unit: item.value.unit,
            imgUrl: item.value.imgUrl,
            showAmountUnit: item.value.showAmountUnit
        }))

        const select = (id: string) => {
            logDebug('Item.select', `selected item with id ${id}`)
            emit('select', id)
        }

        return {
            customItem,
            select
        }
    }
})
</script>

<style>
.small-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    margin: 0;
    background: inherit !important;
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

ion-text.small-item-name {
    font-size: 1rem;
    margin: 0;
}
</style>