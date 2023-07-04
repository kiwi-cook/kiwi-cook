<template>
    <IonList v-if="loadedFilteredItems.length > 0">
        <div v-for="(item, itemIndex) in loadedFilteredItems" :key="itemIndex" class="recipe-preview-container">
            <slot :item="item" name="item">
                <RecipePreview :recipe="item as Recipe"/>
            </slot>
        </div>
    </IonList>
    <IonItem v-else>
        {{ noItemsMessage }}
    </IonItem>
    <IonInfiniteScroll @ionInfinite="ionInfinite">
        <IonInfiniteScrollContent></IonInfiniteScrollContent>
    </IonInfiniteScroll>
</template>

<script lang="ts">
import {IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonList} from '@ionic/vue';
import {computed, ComputedRef, defineComponent, Ref, ref, toRefs, watch} from 'vue';
import {arrowDown} from 'ionicons/icons';
import {useTasteBuddyStore} from '@/storage';
import RecipePreview from "@/components/recipe/RecipePreview.vue";
import {Recipe} from "@/tastebuddy/types";


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
        noItemsMessage: {
            type: String,
            required: false,
            default: 'No recipes found'
        },
    },
    components: {
        RecipePreview,
        IonList, IonInfiniteScroll, IonInfiniteScrollContent, IonItem

    },
    setup(props: any) {
        const {filter, itemList} = toRefs(props)

        const store = useTasteBuddyStore();
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
            resetLoadedItems()
            loadNextItems()
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