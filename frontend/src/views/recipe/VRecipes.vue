<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <h1>
                        All recipes
                    </h1>

                    <IonSearchbar v-model="filterInput" :debounce="500"/>

                    <List :filter="filterInput" :list="recipes">
                        <template #element="{ element }">
                            <RecipePreview :recipe="element as Recipe"/>
                        </template>
                    </List>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {IonContent, IonPage, IonSearchbar} from '@ionic/vue';
import {useRecipeStore} from '@/storage';
import RecipePreview from "@/components/recipe/previews/RecipePreview.vue";
import List from "@/components/recipe/List.vue";
import {Recipe} from "@/tastebuddy";


const filterInput = ref('')

const recipeStore = useRecipeStore()
const recipes = computed(() => recipeStore.getRecipesAsList)
</script>
