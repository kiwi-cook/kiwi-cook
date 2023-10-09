<template>
    <IonPage>
        <IonTabs>
            <!-- Router views -->
            <IonRouterOutlet/>

            <IonProgressBar v-show="loadingState" type="indeterminate"/>
            <IonTabBar slot="bottom">
                <IonTabButton href="/editor/recipe" tab="recipe-editor">
                    Recipe Editor
                </IonTabButton>

                <IonTabButton href="/editor/item" tab="item-editor">
                    Item Editor
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs} from '@ionic/vue';
import {useRecipeStore} from '@/editor/storage';

const recipeStore = useRecipeStore()
const loadingState = computed<boolean>(() => recipeStore.isLoading ?? false)
</script>