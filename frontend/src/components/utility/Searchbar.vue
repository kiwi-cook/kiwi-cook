<template>
    <div class="item-searchbar">
        <IonSearchbar v-model="filterInput" :debounce="500" :placeholder="placeholder"/>
        <div>
            <slot name="item">
                <ItemList v-if="listOpen" class="item-searchbar-results" :items="filteredItems"
                          :placeholder="placeholder"
                          :show-limit="5"
                          :type="['ingredient', 'tool']" v-bind="$attrs"/>
            </slot>
            <slot name="tag">

            </slot>
        </div>
    </div>
</template>


<script lang="ts">
import {defineComponent, PropType, ref, toRefs, watch} from "vue";
import ItemList from "@/components/recipe/ItemList.vue";
import {Item, StepItem} from "@/tastebuddy";
import {IonSearchbar} from "@ionic/vue";

export default defineComponent({
    name: 'Searchbar',
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

<style scoped>
.item-searchbar {
    position: relative;
    width: 100%;
}

.item-searchbar-results {
    border-radius: var(--border-radius);
    border: var(--border);
    box-shadow: var(--box-shadow);
    width: 95%;
    margin: 0 auto;
}
</style>