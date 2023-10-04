<template>
    <IonPage>
        <IonTabs>
            <!-- Router views -->
            <IonRouterOutlet/>

            <IonProgressBar v-show="loadingState" type="indeterminate"/>
            <IonTabBar slot="bottom">
                <IonTabButton href="/recipe/suggestions" tab="recipe-suggestions">
                    <IonIcon :icon="search"/>
                    {{ $t('Tabs.Explore') }}
                </IonTabButton>

                <IonTabButton href="/recipe/of-the-day" tab="recipe-of-the-day">
                    <IonIcon :icon="sparkles"/>
                    {{ $t('Tabs.RecipeOfTheDay') }}
                </IonTabButton>

                <IonTabButton href="/recipe/saved" tab="saved-recipes">
                    <IonIcon :icon="heart"/>
                    {{ $t('Tabs.Favorites') }}
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {IonIcon, IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs,} from '@ionic/vue';
import {heart, search, sparkles} from 'ionicons/icons';
import {useRecipeStore} from '@/storage';

const recipeStore = useRecipeStore()
const loadingState = computed<boolean>(() => recipeStore.isLoading ?? false)
</script>