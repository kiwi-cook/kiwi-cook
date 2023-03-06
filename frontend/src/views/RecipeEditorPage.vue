<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Editor</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-toolbar color="primary">
            <ion-searchbar color="secondary" :debounce="100" @ion-change="handleRecipeFilter($event)" />
        </ion-toolbar>

        <ion-content :fullscreen="true" class="ion-padding">
            <ion-refresher slot="fixed" @ion-refresh="handleRefresh($event)">
                <ion-refresher-content />
            </ion-refresher>
            <ion-accordion-group expand="inset">
                <template v-for="(recipe, recipeIndex) in filteredRecipes" :key="recipe._id + recipeIndex">
                    <ion-accordion :value="recipeIndex.toString()">
                        <ion-item slot="header" color="primary">
                            <ion-label color="light">{{ recipe.name }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <RecipeEditor :recipe="recipe" @remove="removeRecipe(recipeIndex)"/>
                        </div>
                    </ion-accordion>
                </template>
            </ion-accordion-group>
            <ion-button @click="addNewRecipe()">Add new Recipe</ion-button>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { emptyRecipe, Recipe } from '@/api/types';
import RecipeEditor from '@/components/RecipeEditor.vue';
import { useTasteBuddyStore } from '@/storage';
import { IonRefresher, IonRefresherContent, IonPage, IonHeader, IonSearchbar, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonButton } from '@ionic/vue';
import { computed, ComputedRef, defineComponent, ref, watch } from 'vue';

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonRefresher, IonRefresherContent, IonPage, IonHeader, IonSearchbar, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonButton,
        RecipeEditor
    },
    setup() {
        const store = useTasteBuddyStore()
        const recipes: ComputedRef<Recipe[]> = computed(() => store.getters.getRecipes)
        const filteredRecipes = ref<Recipe[]>(recipes.value)
        
        const handleRefresh = async (event: any) => {
            store.dispatch('fetchRecipes').then(() => {
                // set timeout to avoid sus behaviour :)
                setTimeout(() => {
                    // 'complete' tells the refresher to close itself
                    event.detail.complete()
                }, 1700)
            })
        }

        watch(recipes, () => {
            filteredRecipes.value = recipes.value
        })

        const handleRecipeFilter = (event: any) => {
            const query: string = event.target.value.toLowerCase().trim();
            if (query === '') {
                filteredRecipes.value = recipes.value
                return
            }

            filteredRecipes.value = recipes.value.filter(recipe => JSON.stringify(recipe).toLowerCase().includes(query))
        }

        const addNewRecipe = () => {
            recipes.value.push(emptyRecipe)
        }

        const removeRecipe = (index: number) => {
            recipes.value.splice(index, 1)
        }

        return {
            handleRefresh,
            handleRecipeFilter,
            filteredRecipes, addNewRecipe, removeRecipe,
        };
    }
})
</script>