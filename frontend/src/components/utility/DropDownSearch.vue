<template>
    <ion-input color="light" :value="inputValue" @input="handleInput($event)" />

    <ion-list v-if="showItemsList">
        <template v-for="(filteredItem, index) in filteredItems" :key="index">
            <ion-item>
                <ion-button @click="selectItem(filteredItem)">
                    <slot name="item" :filteredItem="filteredItem">
                        <ion-label color="light">{{ filteredItem }}</ion-label>
                    </slot>
                </ion-button>
            </ion-item>
        </template>
    </ion-list>

    <ion-button v-if="showAddItemButton" @click="addItem()">
        Add new item
    </ion-button>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, toRefs } from 'vue';
import { IonLabel, IonInput, IonList, IonItem, IonButton } from '@ionic/vue';

export default defineComponent({
    name: 'DropDownSearch',
    props: {
        modelValue: {
            type: Object,
            required: true
        },
        customMapper: {
            type: Function,
            required: false,
            default: (item: any) => item,
        },
        items: {
            type: Array,
            required: true,
        },
        maxItems: {
            type: Number,
            required: false,
            default: 5,
        },
        placeholder: {
            type: String,
            required: false,
            default: 'Search for an item',
        },
    },
    components: {
        IonLabel, IonInput, IonList, IonItem, IonButton
    },
    setup(props: { modelValue: any, customMapper: any, items: any[], maxItems: number }, ctx: { emit: any }) {
        const { modelValue, customMapper, items, maxItems } = toRefs(props)

        const inputValue: Ref<string> = ref(customMapper.value(modelValue.value))
        const filteredItems: Ref<any[]> = ref(items.value.slice(0, maxItems.value))

        // show the items list only if the input value is not empty
        const showItemsList: Ref<boolean> = ref(false)

        // show the add item button only if the input value is not empty and the items list is empty
        const showAddItemButton: Ref<boolean> = ref(false)

        const handleInput = (event: { target: { value: string; }; }) => {
            const input = event.target.value

            // filter the items
            filteredItems.value = items.value
                .filter((item: { name: string; }) => JSON.stringify(item).toLowerCase().includes(input.toLowerCase()))
                // show only the first 5 results by default
                // change this by setting the maxItems prop
                .slice(0, maxItems.value)

            // update the input value
            inputValue.value = input
            showItemsList.value = inputValue.value !== ''
            showAddItemButton.value = showItemsList.value && filteredItems.value.length === 0
        }

        const selectItem = (selectedItem: any) => {
            inputValue.value = customMapper.value(selectedItem)
            showItemsList.value = false

            // v-model
            // emit the selected item to the parent component and update the item
            ctx.emit('update:modelValue', selectedItem)
        }

        const addItem = () => {
            showItemsList.value = false

            // emit the input value to the parent component and add the item
            ctx.emit('addItem', inputValue.value)
        }

        return {
            inputValue, handleInput,
            filteredItems, showItemsList, selectItem,
            showAddItemButton, addItem
        }
    },
})
</script>