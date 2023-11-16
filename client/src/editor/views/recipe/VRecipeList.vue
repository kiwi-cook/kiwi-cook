<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="['Recipes']"/>

                    <IonList>
                        <IonItem v-for="recipe in recipes" :key="recipe.getId()">
                            <IonLabel>{{ recipe.getName() }}</IonLabel>
                            <IonButton @click="edit(recipe)">
                                <IonIcon :icon="createOutline"/>
                            </IonButton>
                        </IonItem>
                    </IonList>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, useIonRouter} from '@ionic/vue';
import {useRecipeStore} from '@/editor/storage';
import {Recipe} from '@/shared';
import {createOutline} from 'ionicons/icons';
import Header from '@/shared/components/utility/header/Header.vue';

const router = useIonRouter()
const edit = (recipe: Recipe) => router.push({name: 'RecipeEditor', params: {id: recipe.getId()}})
const recipeStore = useRecipeStore()
const recipes = computed(() => recipeStore.getRecipesAsList)
</script>