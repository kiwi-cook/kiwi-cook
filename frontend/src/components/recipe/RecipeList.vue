<template>
    <ion-list>
        <template v-for="recipe in loadedRecipes" :key="recipe.name">
            <RecipePreview :recipe="recipe"/>
        </template>
    </ion-list>
    <ion-infinite-scroll @ionInfinite="ionInfinite">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
    </ion-infinite-scroll>
</template>

<script lang="ts">
import {IonList} from '@ionic/vue';
import {computed, ComputedRef, defineComponent, Ref, ref, toRefs, watch} from 'vue';
import {arrowDown} from 'ionicons/icons';
import {useTasteBuddyStore} from '@/storage';
import {Recipe} from '@/api/types';
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
        IonList,
    },
    setup(props: any) {
        const {filter} = toRefs(props)

        const store = useTasteBuddyStore();
        const recipes: ComputedRef<Recipe[]> = computed(() => store.getters.getRecipes);
        const loadedRecipes: Ref<Recipe[]> = ref([]);
        const loadedRecipesIndex = ref(0);

        /**
         * Filter the ingredients
         */
        const handleFilter = () => {
            const query = filter.value?.toLowerCase() ?? '';
            loadedRecipes.value = recipes.value.filter((recipe: Recipe) => {
                return JSON.stringify(recipe)
                    .toLowerCase()
                    .includes(query)
            })
        }
        watch(filter, () => {
            handleFilter();
        }, {immediate: true})

        const loadNextRecipes = (amountLoaded = 15) => {
            loadedRecipes.value.push(...recipes.value.slice(loadedRecipesIndex.value,
                loadedRecipesIndex.value + amountLoaded))
            loadedRecipesIndex.value += amountLoaded;
        };

        const ionInfinite = (ev: any) => {
            loadNextRecipes();
            setTimeout(() => ev.target.complete(), 500);
        };

        watch(recipes, () => {
            loadedRecipesIndex.value = 0;
            loadNextRecipes()
        })

        return {
            ionInfinite,
            loadedRecipes,
            handleFilter,
            arrowDown
        };

    }
});
</script>

