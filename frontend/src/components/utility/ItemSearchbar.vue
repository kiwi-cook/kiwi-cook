<template>
    <div>
        <IonSearchbar v-model="filterInput" :debounce="500" :placeholder="placeholder"/>
        <ItemList v-if="listOpen" :items="filteredItems" :placeholder="placeholder" :show-limit="5"
                  :type="['ingredient', 'tool']" v-bind="$attrs"/>
    </div>
</template>


<script lang="ts">
import {defineComponent, PropType, ref, toRefs, watch} from "vue";
import ItemList from "@/components/recipe/ItemList.vue";
import {Item, StepItem} from "@/tastebuddy";
import {IonSearchbar} from "@ionic/vue";

export default defineComponent({
    name: 'ItemSearchbar',
    props: {
        placeholder: {
            type: String,
            required: true
        },
        filteredItems: {
            type: Array as PropType<(StepItem[] | Item[])>,
            required: true,
        },
    },
    components: {
        ItemList,
        IonSearchbar
    },
    emits: ['update:modelValue'],
    setup(props, {emit}) {
        const {filteredItems} = toRefs(props);

        const listOpen = ref(false)
        const filterInput = ref('')
        const updateFilterInput = (value: string) => {
            emit('update:modelValue', value)

            // Close list if input is empty
            if (value === '') {
                listOpen.value = false
            }
        }

        watch(filterInput, (value) => {
            updateFilterInput(value)
        })

        watch(filteredItems, (value) => {
            // Close list if filtered items are empty
            if (value.length === 0) {
                listOpen.value = false
                return
            }
            showList()
        })

        function showList() {
            listOpen.value = true
        }

        return {
            listOpen, openPopover: showList,
            filterInput, updateFilterInput
        }
    }
})
</script>