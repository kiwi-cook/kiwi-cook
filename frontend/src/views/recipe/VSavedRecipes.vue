<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :big-text="$t('Favorites.Title').split(';')"/>

                    <template v-if="savedRecipes.length > 0">
                        <List :list="savedRecipes">
                            <template #element="{ element }">
                                <RecipePreview :recipe="element as Recipe"/>
                            </template>
                        </List>
                    </template>
                    <template v-else>
                        <TasteBuddyLogo size="small"/>
                        <h2 class="ion-text-center">
                            {{ $t('Favorites.NoRecipesSaved') }}
                        </h2>
                    </template>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {computed, ComputedRef} from 'vue';
import {IonContent, IonPage} from '@ionic/vue';
import {useRecipeStore} from '@/storage';
import {Recipe} from '@/tastebuddy';
import RecipePreview from "@/components/recipe/previews/RecipePreview.vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import TasteBuddyLogo from "@/components/TasteBuddyLogo.vue";
import List from "@/components/utility/list/List.vue";

const recipeStore = useRecipeStore()
const savedRecipes: ComputedRef<Recipe[]> = computed(() => recipeStore.getSavedRecipes)
</script>
