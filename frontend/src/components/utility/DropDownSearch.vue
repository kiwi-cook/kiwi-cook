<template>
    <ion-input :color="isTemporaryInput ? 'medium' : 'light'" :placeholder="placeholder ?? ''" :value="inputValue"
               type="text"
               @input="handleInput($event)" @keyup.enter="addItem()"/>

    <ion-list v-if="showItemsList">
        <template v-for="(filteredItem, index) in filteredItems" :key="index">
            <ion-item>
                <ion-button @click="selectItem(filteredItem)">
                    <slot :filteredItem="filteredItem" name="item">
                        <ion-label color="light">{{ filteredItem }}</ion-label>
                    </slot>
                </ion-button>
            </ion-item>
        </template>
    </ion-list>

    <ion-button v-if="isTemporaryInput" @click="addItem()">
        Add new item
    </ion-button>
</template>

<script lang="ts">
import {defineComponent, PropType, Ref, ref, toRefs, watch} from 'vue';
import {IonButton, IonInput, IonItem, IonLabel, IonList} from '@ionic/vue';

export default defineComponent({
    name: 'DropDownSearch',
    props: {
        modelValue: {
            type: Object,
            required: true
        },
        customMapper: {
            type: Function as PropType<(item: any) => any>,
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
    emits: ['update:modelValue', 'addItem'],
    setup(props: { modelValue: any, customMapper: (item: any) => any, items: any[], maxItems: number }, ctx: {
        emit: any
    }) {
        const {modelValue, customMapper, items, maxItems} = toRefs(props)

        const inputValue: Ref<string> = ref(customMapper.value?.(modelValue.value))
        // update the input value when the value coming from the parent changes
        watch(modelValue, () => {
            inputValue.value = customMapper.value?.(modelValue.value)
        })
        const filteredItems: Ref<any[]> = ref(items.value.slice(0, maxItems.value))

        // show the items list only if the input value is not empty
        const showItemsList: Ref<boolean> = ref(false)

        // define if the input is temporary or not
        const isTemporaryInput: Ref<boolean> = ref(false)

        const handleInput = (event: { target: { value: string; }; }) => {
            const input = event.target.value

            // filter the items
            filteredItems.value = items.value
                .filter((item: { name: string; }) => JSON.stringify(item).toLowerCase().includes(input.toLowerCase()))
                // show only the first 5 results by default
                // change this by setting the maxItems prop
                .slice(0, maxItems.value)

            // update the input value
            inputValue.value = input.trim()
            showItemsList.value = inputValue.value !== ''
            isTemporaryInput.value = inputValue.value !== ''
        }

        const selectItem = (selectedItem: any) => {
            inputValue.value = customMapper.value?.(selectedItem)
            showItemsList.value = false
            isTemporaryInput.value = false

            // v-model
            // emit the selected item to the parent component and update the item
            ctx.emit('update:modelValue', selectedItem)
        }

        const addItem = () => {
            showItemsList.value = false
            isTemporaryInput.value = false

            // emit the input value to the parent component and add the item
            ctx.emit('addItem', inputValue.value)
        }

        return {
            inputValue, handleInput,
            filteredItems, showItemsList, selectItem,
            isTemporaryInput, addItem
        }
    },
})
</script>