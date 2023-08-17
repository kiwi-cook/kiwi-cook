<template>
    <div :class="['element-list-wrapper', {'horizontal': horizontal}]">
        <ul v-if="loadedFilteredElements.length > 0"
            :class="['element-list', {'horizontal': horizontal}, {'wrap': !noWrap}]">
            <li v-for="(element, elementIndex) in loadedFilteredElements" :key="elementIndex"
                :class="['element', {'horizontal': horizontal}, {'wrap': !noWrap}]">
                <slot :element="element" name="element">
                    {{ element }}
                </slot>
            </li>
        </ul>
    </div>
    <IonInfiniteScroll v-if="!loadAll && loadedFilteredElements.length > 0" @ionInfinite="ionInfinite">
        <IonInfiniteScrollContent></IonInfiniteScrollContent>
    </IonInfiniteScroll>
</template>

<script lang="ts">
import {IonInfiniteScroll, IonInfiniteScrollContent} from '@ionic/vue';
import {computed, ComputedRef, defineComponent, Ref, ref, toRefs, watch} from 'vue';
import {arrowDown} from 'ionicons/icons';
import {useRecipeStore} from '@/storage';


export default defineComponent({
    name: 'List',
    props: {
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
        horizontal: {
            type: Boolean,
            required: false,
            default: false
        },
        loadAll: {
            type: Boolean,
            required: false,
            default: false
        },
    },
    components: {
        IonInfiniteScroll, IonInfiniteScrollContent
    },
    setup(props: any) {
        const {filter, list, loadAll} = toRefs(props)

        const store = useRecipeStore();
        const elements: ComputedRef<unknown[]> = computed(() => (list.value
            ? (list.value ?? [])
            : store.getRecipesAsList));
        const loadedElements: Ref<unknown[]> = ref([]);
        const loadedFilteredElements: Ref<unknown[]> = ref([]);
        const loadedElementsIndex = ref(0);

        /**
         * Filter the ingredients
         */
        const handleFilter = () => {
            const query = filter.value?.toLowerCase() ?? '';
            loadedFilteredElements.value = elements.value.filter((listItem: unknown) => {
                return JSON.stringify(listItem)
                    .toLowerCase()
                    .includes(query)
            })
        }
        watch(filter, () => {
            handleFilter();
        }, {immediate: true})

        const loadNextElements = (amountLoaded = 15) => {
            loadedElements.value.push(...elements.value.slice(loadedElementsIndex.value,
                loadedElementsIndex.value + amountLoaded))
            loadedElementsIndex.value += amountLoaded;
        };

        const resetLoadedElements = () => {
            loadedElements.value = [];
            loadedElementsIndex.value = 0;
        }

        const ionInfinite = (ev: any) => {
            loadNextElements();
            setTimeout(() => ev.target.complete(), 1000);
        };

        watch(elements, () => {
            if (!loadAll.value) {
                resetLoadedElements()
                loadNextElements()
            } else {
                loadedElements.value = elements.value;
            }
        }, {immediate: true})

        watch(loadedElements, () => {
            loadedFilteredElements.value = loadedElements.value;
        }, {immediate: true})

        return {
            ionInfinite,
            loadedFilteredElements,
            // icons
            arrowDown
        };

    }
});
</script>

<style scoped>
.element-list-wrapper {
    overflow-y: scroll;
}

.element-list-wrapper.horizontal {
    overflow-x: scroll;
    width: 100%;
    margin-left: -1rem;
}

ul.element-list {
    list-style-type: none;
    padding: 0;
}

ul.element-list.horizontal {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: start;
    /* works together with margin-left: -1rem of .element-list-wrapper.horizontal */
    margin: 0 0 0 1rem;
}

ul.element-list.horizontal.wrap {
    flex-wrap: wrap;
}

li.element, li.element.horizontal.wrap {
    margin-right: 0;
}

li.element.horizontal {
    margin-right: 1rem;
}
</style>
