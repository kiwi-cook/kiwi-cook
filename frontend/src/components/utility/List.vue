<template>
    <div v-if="loadedFilteredItems.length > 0">
        <div v-for="(item, itemIndex) in loadedFilteredItems" :key="itemIndex" class="recipe-preview-container">
            <slot :item="item" name="item">
                {{ item }}
            </slot>
        </div>
    </div>
    <IonText v-else lines="none">
        {{ noItemsMessage }}
    </IonText>
    <IonInfiniteScroll v-if="!loadAll && loadedFilteredItems.length > 0" @ionInfinite="ionInfinite">
        <IonInfiniteScrollContent></IonInfiniteScrollContent>
    </IonInfiniteScroll>
</template>

<script lang="ts">
import {IonInfiniteScroll, IonInfiniteScrollContent, IonText} from '@ionic/vue';
import {computed, ComputedRef, defineComponent, Ref, ref, toRefs, watch} from 'vue';
import {arrowDown} from 'ionicons/icons';
import {useRecipeStore} from '@/storage';
import {Recipe} from "@/tastebuddy";


export default defineComponent({
    name: 'List',
    props: {
        filter: {
            type: String,
            required: false,
            default: ''
        },
        itemList: {
            type: Array,
            required: false,
            default: null
        },
        loadAll: {
            type: Boolean,
            required: false,
            default: false
        },
        noItemsMessage: {
            type: String,
            required: false,
            default: 'No recipes found'
        },
    },
    components: {
        IonInfiniteScroll, IonInfiniteScrollContent, IonText
    },
    setup(props: any) {
        const {filter, itemList, loadAll} = toRefs(props)

        const store = useRecipeStore();
        const items: ComputedRef<unknown[]> = computed(() => (itemList.value
            ? (itemList.value ?? [])
            : store.getRecipesAsList));
        const loadedItems: Ref<unknown[]> = ref([]);
        const loadedFilteredItems: Ref<unknown[]> = ref([]);
        const loadedItemsIndex = ref(0);

        /**
         * Filter the ingredients
         */
        const handleFilter = () => {
            const query = filter.value?.toLowerCase() ?? '';
            loadedFilteredItems.value = items.value.filter((listItem: unknown) => {
                return JSON.stringify(listItem)
                    .toLowerCase()
                    .includes(query)
            })
        }
        watch(filter, () => {
            handleFilter();
        })

        const loadNextItems = (amountLoaded = 15) => {
            loadedItems.value.push(...items.value.slice(loadedItemsIndex.value,
                loadedItemsIndex.value + amountLoaded))
            loadedItemsIndex.value += amountLoaded;
        };

        const resetLoadedItems = () => {
            loadedItems.value = [];
            loadedItemsIndex.value = 0;
        }

        const ionInfinite = (ev: any) => {
            loadNextItems();
            setTimeout(() => ev.target.complete(), 1000);
        };

        watch(items, () => {
            if (!loadAll.value) {
                resetLoadedItems()
                loadNextItems()
            } else {
                loadedItems.value = items.value;
            }
        }, {immediate: true})

        watch(loadedItems, () => {
            loadedFilteredItems.value = loadedItems.value;
        }, {immediate: true})

        return {
            ionInfinite,
            loadedFilteredItems,
            arrowDown,
            Recipe
        };

    }
});
</script>

<style scoped>
.recipe-preview-container {
    margin-bottom: 1rem;
}
</style>
```