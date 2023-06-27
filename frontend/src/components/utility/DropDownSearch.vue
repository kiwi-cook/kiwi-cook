<template>
    <IonItem lines="none">
        <IonInput :aria-label="inputValue" :color="isTemporaryInput ? 'medium' : 'light'"
                  :placeholder="placeholder ?? ''"
                  :value="inputValue" type="text" @input="handleInput($event)" @keyup.enter="addItem()"/>
    </IonItem>

    <IonList v-if="showItemsList">
        <template v-for="(filteredItem, index) in filteredItems" :key="index">
            <IonItem>
                <IonButton @click="selectItem(filteredItem)">
                    <slot :filteredItem="filteredItem" name="item">
                        <IonLabel color="light">{{ filteredItem }}</IonLabel>
                    </slot>
                </IonButton>
            </IonItem>
        </template>
    </IonList>

    <IonButton v-if="isTemporaryInput" @click="addItem()">
        Add new item
    </IonButton>
</template>

<script lang="ts">
import {defineComponent, PropType, Ref, ref, toRefs, watch} from 'vue';
import {IonButton, IonInput, IonItem, IonLabel, IonList} from '@ionic/vue';

export default defineComponent({
    name: 'DropDownSearch',
    props: {
        modelValue: {
            type: Object,
            required: false
        },
        item: {
            type: Object,
            required: false
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
        resetAfter: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    components: {
        IonLabel, IonInput, IonList, IonItem, IonButton
    },
    emits: ['update:modelValue', 'addItem', 'selectItem'],
    setup(props: {
        modelValue: any,
        item: any,
        customMapper: (item: any) => any,
        items: any[],
        maxItems: number,
        resetAfter: boolean
    }, ctx: {
        emit: any
    }) {
        const {modelValue, item, customMapper, items, maxItems, resetAfter} = toRefs(props)

        // define the input value
        const inputValue: Ref<string> = ref('')
        // update the input value when the value coming from the parent changes
        watch(modelValue, () => {
            if (modelValue.value) {
                inputValue.value = customMapper.value?.(modelValue.value)
            }
        }, {immediate: true})
        watch(item, () => {
            if (item.value) {
                inputValue.value = customMapper.value?.(item.value)
            }
        }, {immediate: true})

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

            ctx.emit('selectItem', selectedItem)

            // v-model
            // emit the selected item to the parent component and update the item
            ctx.emit('update:modelValue', selectedItem)

            // reset the input value after selecting an item
            if (resetAfter.value) {
                inputValue.value = ''
            }
        }

        const addItem = () => {
            showItemsList.value = false
            isTemporaryInput.value = false

            // emit the input value to the parent component and add the item
            ctx.emit('addItem', inputValue.value)

            // reset the input value after selecting an item
            if (resetAfter.value) {
                inputValue.value = ''
            }
        }

        return {
            inputValue, handleInput,
            filteredItems, showItemsList, selectItem,
            isTemporaryInput, addItem
        }
    },
})
</script>