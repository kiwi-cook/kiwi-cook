<template>
    <IonItem v-if="mappedItem" class="item" lines="none">
        <IonThumbnail slot="start" class="item-thumbnail">
            <img :key="mappedItem.name" :alt="mappedItem.name" :src="mappedItem.imgUrl ?? ''" loading="lazy"/>
        </IonThumbnail>
        <IonLabel :class="[{'item-excluded': include === false}, 'item-label']">
            <span v-if="mappedItem.quantity !== 0 && quantityPosition === 'start'" class="item-quantity">
                {{ mappedItem.quantity }} {{ mappedItem.unit }}
            </span>
            {{ mappedItem.name }}
            <span v-if="include" class="item-included">✓</span>
        </IonLabel>
        <div slot="end">
            <slot name="end">
                <span v-if="mappedItem.quantity !== 0 && quantityPosition === 'end'" class="item-quantity">
                    {{ mappedItem.quantity }} {{ mappedItem.unit }}
                </span>
            </slot>
        </div>
    </IonItem>
</template>

<script lang="ts" setup>
import {IonItem, IonLabel, IonThumbnail} from '@ionic/vue';
import {computed, PropType, toRefs} from 'vue';
import {Item, ItemType, StepItem} from '@/shared/ts';

const props = defineProps({
    item: {
        type: Object as PropType<(StepItem | Item)>,
        required: true,
    },
    include: {
        type: Boolean,
        required: false,
        default: undefined
    },
    quantityPosition: {
        type: String as PropType<'start' | 'end'>,
        required: false,
        default: 'end'
    }
})
const {item} = toRefs(props);

type CustomItem = {
    name: string,
    quantity: number,
    unit: string,
    imgUrl: string,
}

const mappedItem = computed<CustomItem | undefined>(() => {
    if (!item?.value) {
        return undefined;
    }
    let quantity: number | undefined;
    if (item?.value instanceof StepItem && item?.value?.type === ItemType.Ingredient) {
        quantity = item?.value?.servings;
    } else {
        quantity = 1;
    }
    const name = item?.value?.getName(undefined, quantity)
    const unit = item?.value instanceof StepItem && item?.value?.type === ItemType.Ingredient ? item?.value?.unit : '';

    return {
        name,
        imgUrl: item?.value?.imgUrl,
        quantity,
        unit,
    }
})
</script>

<style scoped>
ion-item.item::part(native) {
    padding: 0;
    min-width: 200px;
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