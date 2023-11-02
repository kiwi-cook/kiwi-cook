<template>
    <IonItem v-if="mappedItem" class="item" lines="none">
        <IonThumbnail slot="start" class="item-thumbnail">
            <img :key="mappedItem.name" :alt="mappedItem.name" :src="mappedItem.imgUrl ?? ''" loading="lazy"/>
        </IonThumbnail>
        <IonLabel :class="[{'item-excluded': include === false}]">
            {{ mappedItem.name }}
            <span v-if="include" class="item-included">✓</span>
        </IonLabel>
        <div slot="end">
            <slot name="end">
                <template v-if="mappedItem.servings !== 0">
                    {{ mappedItem.servings }} {{ mappedItem.unit }}
                </template>
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
})
const {item} = toRefs(props);

type CustomItem = {
    name: string,
    servings: number,
    unit: string,
    imgUrl: string,
}

const mappedItem = computed<CustomItem | undefined>(() => {
    if (!item?.value) {
        return undefined;
    }
    const servings = item?.value instanceof StepItem && item?.value?.type === ItemType.Ingredient ? item?.value?.servings : 1;

    return {
        name: item?.value?.getName(undefined, servings),
        imgUrl: item?.value?.imgUrl,
        servings,
        unit: item?.value instanceof StepItem && item?.value?.type === ItemType.Ingredient ? item?.value?.unit : '',
    }
})
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