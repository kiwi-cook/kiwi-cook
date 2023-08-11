<template>
    <IonPage id="recipe-list-page">
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <h1>
                        All recipes
                    </h1>

                    <IonSearchbar v-model="filterInput" :debounce="500"/>

                    <List :filter="filterInput" :item-list="recipes">
                        <template #item="{item}">
                            <RecipePreview :recipe="item"/>
                        </template>
                    </List>
                </div>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton>
                    <IonIcon :icon="chevronForwardCircle"/>
                </IonFabButton>
                <IonFabList side="end">
                    <IonFabButton v-if="isDevMode" @click="addRecipe()">
                        <IonIcon :icon="addOutline"/>
                    </IonFabButton>
                    <IonFabButton v-if="isDevMode" @click="saveRecipes()">
                        <IonIcon :icon="saveOutline"/>
                    </IonFabButton>
                </IonFabList>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonPage, IonSearchbar, useIonRouter} from '@ionic/vue';
import {addOutline, chevronForwardCircle, filter, saveOutline} from 'ionicons/icons';
import {useRecipeStore, useTasteBuddyStore} from '@/storage';
import {Recipe} from '@/tastebuddy/types';
import List from "@/components/utility/List.vue";
import RecipePreview from "@/components/recipe/RecipePreview.vue";

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        RecipePreview, List, IonPage, IonSearchbar, IonContent, IonFab, IonFabButton, IonFabList, IonIcon
    },
    setup() {
        const filterInput = ref('')

        const router = useIonRouter()
        const recipeStore = useRecipeStore()
        const recipes = computed(() => recipeStore.getRecipesAsList)

        const tasteBuddyStore = useTasteBuddyStore()
        const isDevMode = computed(() => tasteBuddyStore.isDevMode)
        const addRecipe = () => {
            if (isDevMode.value) {
                const newRecipeId = Recipe.newRecipe().update()._tmpId
                router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
            }
        }
        const saveRecipes = () => {
            if (isDevMode.value) {
                recipeStore.saveRecipes()
            }
        }

        return {
            // icons
            chevronForwardCircle, addOutline, saveOutline,
            // recipe
            recipes,
            isDevMode, addRecipe, saveRecipes,
            // filter
            filterInput, filter
        }
    }
});
</script>
