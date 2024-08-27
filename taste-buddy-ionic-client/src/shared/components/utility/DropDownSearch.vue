<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonInput :aria-label="inputValue" :clear-input="true" :label="label"
              :label-placement="labelPlacement" :placeholder="placeholder ?? ''"
              :value="inputValue" type="text" @input="handleInput($event)" @keyup.enter="addItem()"/>

    <div v-show="showItemsList" class="dropdown-wrapper">
        <div class="dropdown-list">
            <IonList>
                <template v-for="(filteredItem, index) in filteredItems" :key="index">
                    <IonItem lines="none" @click="selectItem(filteredItem)">
                        <slot :filtered-item="filteredItem" name="item">
                            <IonLabel>{{ filteredItem }}</IonLabel>
                        </slot>
                    </IonItem>
                </template>
            </IonList>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { PropType, ref, toRefs, watch } from 'vue';
import { IonInput, IonItem, IonLabel, IonList } from '@ionic/vue';

const props = defineProps({
    label: {
        type: String, required: false, default: undefined,
    }, labelPlacement: {
        type: String as PropType<'start' | 'end' | 'floating' | 'stacked' | 'fixed'>,
        required: false,
        default: 'stacked'
    }, modelValue: {
        type: Object, required: false
    }, item: {
        type: Object, required: false
    }, customMapper: {
        type: Function as PropType<(item: any) => any>, required: false, default: (item: any) => item,
    }, items: {
        type: Array, required: true,
    }, maxItems: {
        type: Number, required: false, default: 5,
    }, placeholder: {
        type: String, required: false, default: 'Search for an item',
    }, resetAfter: {
        type: Boolean, required: false, default: false,
    },
})
const { modelValue, item, customMapper, items, maxItems, resetAfter } = toRefs(props)

const emit = defineEmits(['update:modelValue', 'selectItem'])

// define the input value
const inputValue = ref<string>('')
// update the input value when the value coming from the parent changes
watch(modelValue, () => {
    if (modelValue.value) {
        inputValue.value = customMapper.value?.(modelValue.value)
    }
}, { immediate: true })
watch(item, () => {
    if (item.value) {
        inputValue.value = customMapper.value?.(item.value)
    }
}, { immediate: true })

const filteredItems = ref<unknown[]>(items.value.slice(0, maxItems.value))

// show the items list only if the input value is not empty
const showItemsList = ref<boolean>(false)

// define if the input is temporary or not
const isTemporaryInput = ref<boolean>(false)

const handleInput = (event: { target: { value: string; }; }) => {
    const input = event.target.value

    // filter the items
    filteredItems.value = items.value
        .filter((item: unknown) => JSON.stringify(item).toLowerCase().includes(input.toLowerCase()))
        // show only the first 5 results by default
        // change this by setting the maxItems prop
        .slice(0, maxItems.value)

    // update the input value
    inputValue.value = input.trim()
    showItemsList.value = inputValue.value !== '' && filteredItems.value.length > 0
    isTemporaryInput.value = inputValue.value !== ''
}

const selectItem = (selectedItem: any) => {
    inputValue.value = customMapper.value?.(selectedItem)
    showItemsList.value = false
    isTemporaryInput.value = false

    emit('selectItem', selectedItem)

    // v-model
    // emit the selected item to the parent component and update the item
    emit('update:modelValue', selectedItem)

    // reset the input value after selecting an item
    if (resetAfter.value) {
        inputValue.value = ''
    }
}
</script>

<style scoped>
.dropdown-wrapper {
    position: absolute;
    left: 0;
    z-index: 110;
    width: 100%;
}

.dropdown-list {
    width: 90%;
    max-width: var(--max-width);

    border: var(--border);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-strong);
}
</style>
