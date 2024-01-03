<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <div v-if="list.length > 0" class="element-list-wrapper horizontal">
        <ul :tabindex="0" class="element-list horizontal">
            <li v-for="(element, elementIndex) in list" :key="elementIndex"
                class="element horizontal">
                <slot :element="element" name="element">
                    {{ element }}
                </slot>
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';


const props = defineProps({
    list: {
        type: Array, required: false, default: null
    }, noWrap: {
        type: Boolean, required: false, default: false
    }, maxHeight: {
        type: String, required: false, default: '100%'
    }
})
const {list} = toRefs(props)
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
