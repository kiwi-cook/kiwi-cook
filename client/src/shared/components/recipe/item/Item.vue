<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonItem v-if="decomposedIngredient" class="item" lines="none">
        <IonThumbnail slot="start" class="item-thumbnail">
            <img :key="decomposedIngredient.name.get()" :alt="`Thumbnail of ${decomposedIngredient.name.get()}`"
                 :src="decomposedIngredient.imgUrl ?? ''" loading="lazy"/>
        </IonThumbnail>
        <IonLabel :class="[{'item-excluded': include === false}, 'item-label']">
            <span v-if="decomposedIngredient.quantity !== 0 && quantityPosition === 'start'" class="item-quantity">
                {{ decomposedIngredient.quantity }} {{ decomposedIngredient.unit }}
            </span>
            {{ decomposedIngredient.name.get() }}
            <span v-if="include" class="item-included">✓</span>
        </IonLabel>
        <div slot="end">
            <slot name="end">
                <span v-if="decomposedIngredient.quantity !== 0 && quantityPosition === 'end'" class="item-quantity">
                    {{ decomposedIngredient.quantity }} {{ decomposedIngredient.unit }}
                </span>
            </slot>
        </div>
    </IonItem>
</template>

<script lang="ts" setup>
import { IonItem, IonLabel, IonThumbnail } from '@ionic/vue';
import { computed, PropType, toRefs } from 'vue';
import { Ingredient, MultiLanguageField, RecipeIngredient } from '@/shared';

const props = defineProps({
    ingredient: {
        type: Object as PropType<(RecipeIngredient | Ingredient)>, required: true,
    }, include: {
        type: Boolean, required: false, default: undefined
    }, quantityPosition: {
        type: String as PropType<'start' | 'end'>, required: false, default: 'end'
    }
})
const { ingredient } = toRefs(props);

type CustomItem = {
    name: MultiLanguageField, quantity: number, unit: string, imgUrl: string,
}

const decomposedIngredient = computed<CustomItem | undefined>(() => {
    if (!ingredient.value) {
        return undefined;
    }

    const customItem: CustomItem = {
        name: MultiLanguageField.new(),
        quantity: 0,
        unit: '',
        imgUrl: '',
    };

    if (ingredient.value instanceof RecipeIngredient) {
        const recipeIngredient = ingredient.value;
        customItem.name = recipeIngredient.ingredient.name;
        customItem.quantity = recipeIngredient.getQuantity();
        customItem.imgUrl = recipeIngredient.ingredient.imgUrl ?? '';
        customItem.unit = recipeIngredient.unit ?? '';
    } else {
        customItem.name = ingredient.value.name;
        customItem.imgUrl = ingredient.value.imgUrl ?? '';
    }

    return customItem;
});
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

.item-quantity {
    font-weight: bold;
    color: var(--ion-color-secondary);
}
</style>
