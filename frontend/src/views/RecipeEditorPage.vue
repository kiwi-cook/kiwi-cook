<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Editor</ion-title>
                <ion-buttons slot="primary">
                    <ion-button>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true" class="ion-padding">
            <template v-for="(recipe, recipeIndex) in recipes" :key="recipe._id  + recipeIndex">
                <RecipeEditor :recipe="recipe" />
            </template>
            <ion-button @click="addNewRecipe()">Add new Recipe</ion-button>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { getFromAPI } from '@/api';
import { API_ROUTE } from '@/api/constants';
import { dummyRecipe, Recipe } from '@/api/types';
import RecipeEditor from '@/components/RecipeEditor.vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonContent,
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