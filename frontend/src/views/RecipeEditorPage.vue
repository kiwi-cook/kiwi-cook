<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Editor</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true" class="ion-padding">
            <ion-accordion-group expand="inset">
                <template v-for="(recipe, recipeIndex) in recipes" :key="recipe._id + recipeIndex">
                    <ion-accordion :value="recipe.name">
                        <ion-item slot="header" color="primary">
                            <ion-label color="light">{{ recipe.name }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <RecipeEditor :recipe="recipe"  />
                        </div>
                    </ion-accordion>
                </template>
            </ion-accordion-group>
            <ion-button @click="addNewRecipe()">Add new Recipe</ion-button>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { getFromAPI } from '@/api';
import { API_ROUTE } from '@/api/constants';
import { dummyRecipe, Recipe } from '@/api/types';
import RecipeEditor from '@/components/RecipeEditor.vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel } from '@ionic/vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonAccordion, IonAccordionGroup, IonItem, IonLabel,
        RecipeEditor
    },
    setup() {
        getFromAPI(API_ROUTE.GET_RECIPES, {
            callback: (data: Recipe[]) => {
                recipes.value = data
            }
        })

        const recipes = ref<Recipe[]>([])

        const addNewRecipe = () => {
            recipes.value.push(dummyRecipe)
        }

        return {
            addNewRecipe,
            recipes
        };
    }
})
</script>