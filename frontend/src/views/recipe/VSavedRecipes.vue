<template>
    <IonPage id="recipe-list-page">
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :header="['Your', 'favorite recipes']"/>
                    <IonSearchbar v-model="filterInput" :debounce="500" placeholder="Filter saved recipes"/>

                    <List :filter="filterInput" :list="savedRecipes"
                          no-items-message="Save recipes to find them faster">
                        <template #element="{ element }">
                            <RecipePreview :recipe="element as Recipe"/>
                        </template>
                    </List>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, ref} from 'vue';
import {IonContent, IonPage, IonSearchbar, useIonRouter} from '@ionic/vue';
import {addOutline, filter} from 'ionicons/icons';
import {useRecipeStore, useTasteBuddyStore} from '@/storage';
import {Recipe} from '@/tastebuddy/types';
import List from "@/components/recipe/List.vue";
import RecipePreview from "@/components/recipe/previews/RecipePreview.vue";
import FancyHeader from "@/components/utility/FancyHeader.vue";

export default defineComponent({
    name: 'RecipeSavedPage',
    components: {
        FancyHeader,
        RecipePreview, List, IonPage, IonSearchbar, IonContent
    },
    setup() {
        const filterInput = ref('')

        const recipeStore = useRecipeStore()
        const savedRecipes: ComputedRef<Recipe[]> = computed(() => recipeStore.getSavedRecipes)

        const router = useIonRouter()
        const tasteBuddyStore = useTasteBuddyStore()
        const isDevMode = computed(() => tasteBuddyStore.isDevMode)
        const addRecipe = () => {
            if (isDevMode.value) {
                const newRecipeId = Recipe.newRecipe().update()._tmpId
                router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
            }
        }

        return {
            // recipe
            savedRecipes, addOutline, addRecipe, isDevMode,
            // filter
            filterInput, filter
        }
    }
});
</script>
