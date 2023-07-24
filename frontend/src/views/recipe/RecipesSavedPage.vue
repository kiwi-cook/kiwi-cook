<template>
    <IonPage id="recipe-list-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <h1 class="header-title">
                    Your favorite recipes
                </h1>
                <IonSearchbar v-model="filterInput" :debounce="500" placeholder="Search through your recipes"/>

                <List :item-list="savedRecipes" :filter="filterInput"
                      no-items-message="Save recipes to find them faster">
                    <template #item="{ item }">
                        <RecipePreview :recipe="item"/>
                    </template>
                </List>
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
import List from "@/components/utility/List.vue";
import RecipePreview from "@/components/recipe/RecipePreview.vue";

export default defineComponent({
    name: 'RecipeSavedPage',
    components: {
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
