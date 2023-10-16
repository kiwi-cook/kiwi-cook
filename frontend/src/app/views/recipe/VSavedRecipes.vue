<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <TypedHeader :big-text="$t('Favorites.Title').split(';')"/>

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

<script lang="ts" setup>
import {computed} from 'vue';
import {IonContent, IonPage} from '@ionic/vue';
import {useRecipeStore} from '@/app/storage';
import {Recipe} from '@/shared';
import RecipePreview from "@/app/components/recipe/previews/RecipePreview.vue";
import TypedHeader from "@/shared/components/utility/header/TypedHeader.vue";
import TasteBuddyLogo from "@/app/components/TasteBuddyLogo.vue";
import List from "@/shared/components/utility/list/List.vue";

const recipeStore = useRecipeStore()
const savedRecipes = computed<Recipe[]>(() => recipeStore.getSavedRecipes)
</script>
