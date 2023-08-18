<template>
    <IonPage id="recipe-list-page">
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :bigText="['Your', 'favorite recipes']"/>
                    <IonSearchbar v-model="filterInput" :debounce="500" placeholder="Search saved recipes"/>

                    <template v-if="savedRecipes.length > 0">
                        <List :filter="filterInput" :list="savedRecipes">
                            <template #element="{ element }">
                                <RecipePreview :recipe="element as Recipe"/>
                            </template>
                        </List>
                    </template>
                    <template v-else>
                        <TasteBuddyLogo size="small"/>
                        <h2 class="ion-text-center">
                            You have no saved recipes yet.
                        </h2>
                    </template>
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
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import TasteBuddyLogo from "@/components/TasteBuddyLogo.vue";

export default defineComponent({
    name: 'RecipeSavedPage',
    components: {
        TasteBuddyLogo,
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
