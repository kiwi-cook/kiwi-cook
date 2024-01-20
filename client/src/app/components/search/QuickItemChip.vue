<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<!-- Item as a chip that is suggested in the searchbar -->
<template>
    <IonChip v-if="item" :color="color" class="item-chip">
        <IonThumbnail :key="item.getName()" class="item-chip-thumbnail">
            <img :alt="item.getName()" :src="item.imgUrl ?? ''" loading="lazy"/>
        </IonThumbnail>
        <IonLabel class="item-chip-label">
            {{ item.getName() }}
        </IonLabel>
        
        <IonButton v-if="!onlyRemove"
                   :color="_included && _selected ? 'success' : 'medium'" class="item-chip-selection"
                   fill="outline" shape="round"
                   @click="updateState(true)">
            <IonIcon :icon="_included && _selected ? thumbsUp : thumbsUpOutline"/>
        </IonButton>
        <IonButton v-if="!onlyRemove" :color="!_included && _selected ? 'danger' : 'medium'" class="item-chip-selection"
                   fill="outline"
                   shape="round"
                   @click="updateState(false)">
            <IonIcon :icon="!_included && _selected ? thumbsDown : thumbsDownOutline"/>
        </IonButton>
        <IonButton v-if="onlyRemove" class="item-chip-selection" color="medium"
                   fill="outline"
                   shape="round"
                   @click="remove()">
            <IonIcon :icon="closeOutline"/>
        </IonButton>
    </IonChip>
</template>

<script lang="ts" setup>
import { IonButton, IonChip, IonIcon, IonLabel, IonThumbnail } from '@ionic/vue';
import { computed, PropType, ref, toRefs, watch } from 'vue';
import { Item } from '@/shared';
import { closeOutline, thumbsDown, thumbsDownOutline, thumbsUp, thumbsUpOutline } from 'ionicons/icons';

const props = defineProps({
    item: {
        type: Object as PropType<Item>, required: true,
    }, onlyRemove: {
        type: Boolean, required: false, default: false,
    }, included: {
        type: undefined as unknown as PropType<boolean | undefined>, required: false, default: undefined,
    }
})
const {item, onlyRemove, included} = toRefs(props);

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
}, {immediate: true})
</script>

<style scoped>
.item-chip {
    margin: 0 0.5rem 0.5rem 0;

}

.item-chip-thumbnail {
    --border-radius: 50%;
    width: 2rem;
    height: 2rem;
}

.item-chip-label {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
}

.item-chip-label::after {
    content: '';
    display: block;
    width: 100%;
    height: 0.1rem;
    background-color: var(--ion-color-primary);
    border-radius: 0.2rem;
    margin-top: 0.2rem;
}

.item-chip-label::after, .item-chip-label::before {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

.item-chip-selection {
    --border-width: thin;
}
</style>