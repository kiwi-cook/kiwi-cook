<template>
    <ion-list>
        <template v-for="recipe in filteredRecipe" :key="recipe.name">
            <RecipePreview :recipe="recipe" />
        </template>
    </ion-list>
</template>

<script lang="ts">
import { IonList } from '@ionic/vue';
import { computed, ComputedRef, defineComponent, ref, toRefs, watch } from 'vue';
import { arrowDown } from 'ionicons/icons';
import { useTasteBuddyStore } from '@/storage';
import { Recipe } from '@/api/types';
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
        const { filter } = toRefs(props)

        const store = useTasteBuddyStore();
        const recipes: ComputedRef<Recipe[]> = computed(() => store.getters.getRecipes);

        const filteredRecipe = ref(recipes.value);

        /**
         * Filter the ingredients
         */
        const handleFilter = () => {
            const query = filter.value?.toLowerCase() ?? '';
            filteredRecipe.value = recipes.value.filter((recipe: Recipe) => JSON.stringify(recipe).toLowerCase().includes(query))
        }
        watch(filter, () => {
            handleFilter();
        }, { immediate: true })

        watch(recipes, () => {
            filteredRecipe.value = recipes.value;
        })

        return {
            filteredRecipe,
            handleFilter,
            arrowDown
        };

    }
});
</script>

