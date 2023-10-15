<template>
    <div v-if="filteredElements.length > 0" class="element-list-wrapper horizontal">
        <ul :tabindex="0" class="element-list horizontal">
            <li v-for="(element, elementIndex) in filteredElements" :key="elementIndex"
                class="element horizontal">
                <slot :element="element" name="element">
                    {{ element }}
                </slot>
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
import {computed, ref, toRefs, watch} from 'vue';


const props = defineProps({
    filter: {
        type: String,
        required: false,
        default: ''
    },
    list: {
        type: Array,
        required: false,
        default: null
    },
    noWrap: {
        type: Boolean,
        required: false,
        default: false
    },
    maxHeight: {
        type: String,
        required: false,
        default: '100%'
    },
    loadAll: {
        type: Boolean,
        required: false,
        default: false
    }
})
const {filter, list} = toRefs(props)

const elements = computed(() => (list.value ?? []));
const filteredElements = ref<unknown[]>([]);

/**
 * Filter the ingredients
 */
const handleFilter = () => {
    const query = filter.value?.toLowerCase() ?? '';
    filteredElements.value = elements.value.filter((listItem: unknown) => {
        return JSON.stringify(listItem)
            .toLowerCase()
            .includes(query)
    })
}
watch(filter, () => {
    handleFilter();
}, {immediate: true})
</script>

<style scoped>
.element-list-wrapper {
    overflow-y: scroll;
    height: 100%;
}

.element-list-wrapper.horizontal {
    overflow-x: scroll;
    overflow-y: visible;
    width: 100%;
}

ul.element-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

ul.element-list.horizontal {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
}

ul.element-list.horizontal.wrap {
    flex-wrap: wrap;
}

li.element {
    margin-bottom: 0.3rem;
}

li.element, li.element.horizontal.wrap {
    margin-right: 0;
}

li.element.horizontal {
    margin-right: 1rem;
    margin-bottom: 0;
}
</style>
