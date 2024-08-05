<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <div v-if="loadedElements.length > 0" :style="{'max-height': maxHeight}" class="element-list-wrapper">
        <ul :class="['element-list', {'wrap': !noWrap}]" :tabindex="0">
            <li v-for="(element, elementIndex) in loadedElements" :key="hash(element) + elementIndex"
                :class="['element', {'wrap': !noWrap}]">
                <slot :element="element" name="element">
                    {{ element }}
                </slot>
            </li>
        </ul>
    </div>
    <IonInfiniteScroll v-if="!loadAll && loadedElements.length > 0" @ionInfinite="ionInfinite">
        <IonInfiniteScrollContent/>
    </IonInfiniteScroll>
</template>

<script lang="ts" setup>
import { IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue';
import { ref, toRefs, watch } from 'vue';
import { hash } from '@/shared';

const props = defineProps({
    list: {
        type: Array, required: false, default: null
    },
    noWrap: {
        type: Boolean, required: false, default: false
    },
    maxHeight: {
        type: String, required: false, default: '100%'
    },
    loadAll: {
        type: Boolean, required: false, default: false
    }
});

const { list, loadAll } = toRefs(props);

const loadedElements = ref<unknown[]>([]);
const loadedElementsIndex = ref(0);

const loadNextElements = (amountLoaded = 15) => {
    loadedElements.value.push(...list.value.slice(loadedElementsIndex.value, loadedElementsIndex.value +
        amountLoaded))
    loadedElementsIndex.value += amountLoaded;
};

const resetLoadedElements = () => {
    loadedElements.value = [];
    loadedElementsIndex.value = 0;
};

const ionInfinite = (ev: any) => {
    loadNextElements();
    setTimeout(() => ev.target.complete(), 1000);
};

watch(list, () => {
    if (!loadAll.value) {
        resetLoadedElements();
        loadNextElements();
    } else {
        loadedElements.value = list.value;
    }
}, { immediate: true });
</script>


<style scoped>
.element-list-wrapper {
    overflow-y: scroll;
    height: 100%;
}

ul.element-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

li.element {
    margin-bottom: 0.3rem;
    margin-right: 0;
}
</style>
