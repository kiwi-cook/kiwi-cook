<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <template v-if="recipe">
                        <RecipeComponent :recipe="recipe"/>
                    </template>
                </div>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton color="primary" @click="goBack()">
                    <IonIcon :icon="arrowBack"/>
                </IonFabButton>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {computed, ComputedRef} from 'vue';
import {IonContent, IonFab, IonFabButton, IonIcon, IonPage, useIonRouter} from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import {useRecipeStore} from "@/storage";
import {useRoute} from 'vue-router';
import {APP_NAME, Recipe} from '@/tastebuddy';
import {arrowBack} from "ionicons/icons";
import {useHead} from "@unhead/vue";


const route = useRoute()
const recipeId: ComputedRef<string> = computed(() => (route.params.id ?? '') as string)

const store = useRecipeStore()
const recipe: ComputedRef<Recipe> = computed(() => store.getRecipesAsMap[recipeId.value])

const router = useIonRouter()
const goBack = () => router.back()

/* Head */
useHead({
    title: `${APP_NAME}| ${recipe?.value?.getName()}`,
    meta: [
        {
            name: 'og:title',
            content: APP_NAME
        },
        {
            name: 'og:description',
            content: `Delicious ${recipe?.value?.getName()} Made Easy!`
        },
        {
            name: 'og:image',
            content: recipe?.value?.props?.imgUrl
        }
    ]

})
</script>