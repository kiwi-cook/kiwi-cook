<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="$t('Favorites.Title').split(';')"
                            :small-text="savedRecipes.length + ' ' + $t('General.Recipe', savedRecipes.length)"/>

                    <template v-if="savedRecipes.length > 0">
                        <IonItem>
                            <IonButton @click="removeSavedRecipes">
                                Remove all
                            </IonButton>
                        </IonItem>

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
            <FabTimer/>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {IonButton, IonContent, IonItem, IonPage} from '@ionic/vue';
import {useRecipeStore} from '@/app/storage';
import {Recipe} from '@/shared/ts';
import RecipePreview from '@/app/components/recipe/previews/RecipePreview.vue';
import Header from '@/shared/components/utility/header/Header.vue';
import TasteBuddyLogo from '@/app/components/TasteBuddyLogo.vue';
import List from '@/shared/components/utility/list/List.vue';
import FabTimer from '@/shared/components/utility/FabTimer.vue';

const recipeStore = useRecipeStore()
const savedRecipes = computed<Recipe[]>(() => recipeStore.getSavedRecipes)

const removeSavedRecipes = () => recipeStore.setSavedRecipes([])
</script>
