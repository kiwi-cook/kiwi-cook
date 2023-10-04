<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div v-if="recipe" class="content">
                    <RecipeComponent :recipe="recipe"/>
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
const title = computed(() => `${APP_NAME} | ${recipe?.value?.getName()}`)
useHead({
    title: title.value,
    meta: [
        {
            name: 'description',
            content: `Discover the best ${recipe?.value?.getName()} on ${APP_NAME}. Quick, easy, and perfect for busy weeknights.`
        },
        {
            name: 'keywords',
            content: recipe?.value?.getTags().join(', ')
        },
        {
            property: 'og:title',
            content: title.value
        },
        {
            property: 'og:type',
            content: 'article'
        },
        {
            property: 'og:description',
            content: `Discover the best ${recipe?.value?.getName()}. Quick, easy, and perfect for busy weeknights.`
        },
        {
            property: 'og:url',
            content: 'https://taste-buddy.github.io/#/' + recipe?.value?.getRoute()
        },
        {
            property: 'og:image',
            content: recipe?.value?.props?.imgUrl
        },
        {
            property: 'image_src',
            content: recipe?.value?.props?.imgUrl
        },
    ]
})
</script>