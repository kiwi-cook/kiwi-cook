<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<!-- Item as a chip that is suggested in the searchbar -->
<template>
    <IonChip v-if="ingredient" :color="color" class="ingredient-chip">
        <IonThumbnail v-if="ingredient.imgUrl" :key="ingredient.getName()" class="ingredient-chip-thumbnail">
            <img :alt="ingredient.getName()" :src="ingredient.imgUrl ?? ''" loading="lazy"/>
        </IonThumbnail>
        <IonLabel class="ingredient-chip-label">
            {{ ingredient.getName() }}
        </IonLabel>
    </IonChip>
</template>

<script lang="ts" setup>
import { IonChip, IonLabel, IonThumbnail } from '@ionic/vue';
import { computed, PropType, ref, toRefs, watch } from 'vue';
import { Ingredient } from '@/shared';

const props = defineProps({
    ingredient: {
        type: Object as PropType<Ingredient>, required: true,
    }, onlyRemove: {
        type: Boolean, required: false, default: false,
    }, included: {
        type: undefined as unknown as PropType<boolean | undefined>, required: false, default: undefined,
    }
})
const { ingredient, onlyRemove, included } = toRefs(props);

const emit = defineEmits({
    'update:included': (included: boolean | undefined) => included, 'removed': () => true,
})

const _selected = ref(false);
const _included = ref(false);
const color = computed(() => {
    if (_selected.value) {
        return _included.value ? 'success' : 'danger';
    }
    return 'medium';
})

const remove = () => {
    _selected.value = false;
    _included.value = false;
    emit('removed');
}

const updateState = (include: boolean) => {
    _selected.value = include != _included.value || (!include && !_selected.value)
    if (!_selected.value) {
        remove()
    } else {
        _included.value = include;
        emit('update:included', include);
    }
}

watch(included, (newValue) => {
    if (newValue === undefined) {
        _selected.value = false;
        _included.value = false;
    } else {
        _included.value = newValue;
        _selected.value = true
    }
}, { immediate: true })
</script>

<style scoped>
.ingredient-chip {
    margin: 0 0.5rem 0.5rem 0;

}

.ingredient-chip-thumbnail {
    --border-radius: 50%;
    width: 2rem;
    height: 2rem;
}

.ingredient-chip-label {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
}

.ingredient-chip-label::after {
    content: '';
    display: block;
    width: 100%;
    height: 0.1rem;
    background-color: var(--ion-color-primary);
    border-radius: 0.2rem;
}

.ingredient-chip-label::after, .ingredient-chip-label::before {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

.ingredient-chip-selection {
    --border-width: thin;
}
</style>
