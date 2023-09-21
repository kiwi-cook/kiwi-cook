<template>
    <IonItem v-if="mappedItem" :class="['item', {'button':!disableClick}]" lines="none" @click="select">
        <IonThumbnail slot="start" class="item-thumbnail">
            <img v-if="mappedItem.imgUrl" :src="mappedItem.imgUrl ?? ''" class="item-img-lm"
                 :alt="`Image of ${mappedItem.name}`"/>
        </IonThumbnail>
        <IonLabel :class="[{'item-excluded': include === false}]">
            {{ mappedItem.name }}
            <span v-if="include" class="item-included">✓</span>
        </IonLabel>
        <div slot="end">
            <slot name="end">
                {{ mappedItem.quantity }} {{ mappedItem.unit }}
            </slot>
        </div>
    </IonItem>
</template>

<script setup lang="ts">
import {IonItem, IonThumbnail} from "@ionic/vue";
import {computed, PropType, toRefs} from "vue";
import {Item, StepItem} from "@/tastebuddy";

const props = defineProps({
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
    },
})
const {item} = toRefs(props);

const emit = defineEmits(['select'])

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
    const quantity = item.value instanceof StepItem ? item.value.servings : 0;

    return {
        id: item.value?.getId() ?? '',
        name: item.value?.getName(),
        imgUrl: item.value?.imgUrl,
        quantity,
        unit: item.value instanceof StepItem ? item.value.unit : '',
        type: item.value?.type
    }
})

const select = () => {
    if (mappedItem.value && !props.disableClick) {
        emit('select', mappedItem.value.id)
    }
}
</script>

<style scoped>

ion-item.item::part(native) {
    padding: 0;
    min-width: 230px;
}

.item.button {
    cursor: pointer;
}

.item-thumbnail {
    border-radius: var(--border-radius);
    background-color: var(--ion-color-light);
}

ion-thumbnail {
    --size: 30px;
    --border-radius: 5px;
    border: 1px solid var(--ion-color-light);
    background-color: var(--ion-color-dark);
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
</style>