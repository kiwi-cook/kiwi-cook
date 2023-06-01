<template>
    <ion-page id="recipe-detail-page">
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>{{ recipe?.name }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="content">
                <ion-header collapse="condense">
                    <ion-toolbar>
                        <ion-title size="large">{{ recipe?.name }}</ion-title>
                    </ion-toolbar>
                </ion-header>
                <template v-if="recipe">
                    <RecipeComponent :recipe="recipe" />
                </template>
            </div>
            <ion-fab slot="fixed" horizontal="start" vertical="bottom">
                <ion-fab-button color="tertiary" @click="goBack()">
                    <ion-icon :icon="arrowBack" />
                </ion-fab-button>
                <template v-if="isDevMode">
                    <ion-fab-button color="primary" @click="editRecipe()">
                        <ion-icon :icon="createOutline" />
                    </ion-fab-button>
                </template>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import { useTasteBuddyStore } from "@/storage";
import { useRoute, useRouter } from 'vue-router';
import { Recipe } from '@/tastebuddy/types';
import { arrowBack, createOutline } from "ionicons/icons";


export default defineComponent({
    title: 'RecipeOfTheDayPage',
    components: {
        IonFabButton, IonIcon, IonFab,
        RecipeComponent,
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle
    },
    setup() {
        const route = useRoute()
        const recipeId: ComputedRef<string> = computed(() => (route.params.id ?? '') as string)

        const store = useTasteBuddyStore()
        const recipe: ComputedRef<Recipe> = computed(() => store.getters.getRecipesAsMap[recipeId.value])
        const isDevMode = computed(() => store.getters.isDevMode)
        const editRecipe = () => {
            if (isDevMode.value) {
                router.push({ name: 'RecipeEditor', params: { id: recipeId.value } })
            }
        }


        const router = useRouter()
        const goBack = () => router.go(-1)

        return {
            // recipe
            recipe, isDevMode, editRecipe, createOutline,
            // navigation
            goBack, arrowBack
        }
    }
});
</script>

<style scoped>
.gradient {
    background: linear-gradient(to bottom, #2F3540 0%, rgba(0, 0, 0, 0) 100%);
}
</style>