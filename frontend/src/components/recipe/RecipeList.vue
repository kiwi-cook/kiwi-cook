<template>
    <ion-list>
        <template v-for="recipe in loadedFilteredRecipes" :key="recipe.name">
            <RecipePreview :recipe="recipe"/>
        </template>
    </ion-list>
    <ion-infinite-scroll @ionInfinite="ionInfinite">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
    </ion-infinite-scroll>
</template>

<script lang="ts">
import {IonInfiniteScroll, IonInfiniteScrollContent, IonList} from '@ionic/vue';
import {computed, ComputedRef, defineComponent, Ref, ref, toRefs, watch} from 'vue';
import {arrowDown} from 'ionicons/icons';
import {useTasteBuddyStore} from '@/storage';
import {Recipe} from '@/tastebuddy/types';
import RecipePreview from "@/components/recipe/RecipePreview.vue";


export default defineComponent({
    name: 'RecipeList',
    props: {
        filter: {
            type: String,
            required: false,
            default: ''
        }
    },
    components: {
        RecipePreview,
        IonList, IonInfiniteScroll, IonInfiniteScrollContent

    },
    setup(props: any) {
        const {filter} = toRefs(props)

        const store = useTasteBuddyStore();
        const recipes: ComputedRef<Recipe[]> = computed(() => store.getters.getRecipes);
        const loadedRecipes: Ref<Recipe[]> = ref([]);
        const loadedFilteredRecipes: Ref<Recipe[]> = ref([]);
        const loadedRecipesIndex = ref(0);

        /**
         * Filter the ingredients
         */
        const handleFilter = () => {
            const query = filter.value?.toLowerCase() ?? '';
            loadedFilteredRecipes.value = recipes.value.filter((recipe: Recipe) => {
                return JSON.stringify(recipe)
                    .toLowerCase()
                    .includes(query)
            })
        }
        watch(filter, () => {
            handleFilter();
        })

        const loadNextRecipes = (amountLoaded = 15) => {
            loadedRecipes.value.push(...recipes.value.slice(loadedRecipesIndex.value,
                loadedRecipesIndex.value + amountLoaded))
            loadedRecipesIndex.value += amountLoaded;
        };

        const ionInfinite = (ev: any) => {
            loadNextRecipes();
            setTimeout(() => ev.target.complete(), 1000);
        };

        watch(recipes, () => {
            loadedRecipesIndex.value = 0;
            loadNextRecipes()
        }, {immediate: true})

        watch(loadedRecipes, () => {
            loadedFilteredRecipes.value = loadedRecipes.value;
        }, {immediate: true})

        return {
            ionInfinite,
            loadedFilteredRecipes,
            handleFilter,
            arrowDown
        };

    }
});
</script>

