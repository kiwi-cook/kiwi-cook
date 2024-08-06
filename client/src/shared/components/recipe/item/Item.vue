<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonItem v-if="decomposedIngredient" class="item" lines="none">
        <IonThumbnail v-if="decomposedIngredient.imgUrl" slot="start" class="item-thumbnail">
            <img :key="decomposedIngredient.name.get()" :alt="`Thumbnail of ${decomposedIngredient.name.get()}`"
                 :src="decomposedIngredient.imgUrl" loading="lazy"/>
        </IonThumbnail>
        <IonLabel class="item-label">
            <span v-if="decomposedIngredient.quantity !== 0 && quantityPosition === 'start'" class="item-quantity">
                {{ decomposedIngredient.quantity }} {{ decomposedIngredient.unit }}
            </span>
            {{ decomposedIngredient.name.get() }}
            <span v-if="decomposedIngredient.comment" class="item-comment">
                ({{ decomposedIngredient.comment }})
            </span>
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
    }, quantityPosition: {
        type: String as PropType<'start' | 'end'>, required: false, default: 'end'
    }
})
const { ingredient } = toRefs(props);

type CustomItem = {
    name: MultiLanguageField, quantity: number, unit: string, imgUrl: string, comment?: string
}
const roundQuantity = (num: number) => {
    return Math.round(num * 40) / 40;
};

const decomposedIngredient = computed<CustomItem | undefined>(() => {
    if (!ingredient.value) {
        return undefined;
    }

    const customItem: CustomItem = {
        name: MultiLanguageField.new(),
        quantity: 0,
        unit: '',
        imgUrl: '',
        comment: '',
    };

    if (ingredient.value instanceof RecipeIngredient) {
        const recipeIngredient = ingredient.value;
        customItem.name = recipeIngredient.ingredient.name;
        customItem.quantity = roundQuantity(recipeIngredient.getQuantity());
        customItem.imgUrl = recipeIngredient.ingredient.imgUrl ?? '';
        customItem.unit = recipeIngredient.unit ?? '';
        customItem.comment = recipeIngredient.comment ?? '';
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

.item-quantity {
    font-weight: bold;
    color: var(--ion-color-secondary);
}

.item-comment {
    font-size: var(--font-size-smaller);
    color: var(--ion-color-medium);
}
</style>
