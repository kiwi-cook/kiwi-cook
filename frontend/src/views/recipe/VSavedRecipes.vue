<template>
    <IonPage>
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

<script setup lang="ts">
import {computed, ComputedRef, ref} from 'vue';
import {IonContent, IonPage, IonSearchbar} from '@ionic/vue';
import {useRecipeStore} from '@/storage';
import {Recipe} from '@/tastebuddy';
import List from "@/components/recipe/List.vue";
import RecipePreview from "@/components/recipe/previews/RecipePreview.vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import TasteBuddyLogo from "@/components/TasteBuddyLogo.vue";


const filterInput = ref('')

const recipeStore = useRecipeStore()
const savedRecipes: ComputedRef<Recipe[]> = computed(() => recipeStore.getSavedRecipes)
</script>
