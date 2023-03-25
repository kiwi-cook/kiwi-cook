<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>Recipe of the Day</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="content">
                <ion-header collapse="condense">
                    <ion-toolbar>
                        <ion-title size="large">Recipe of the Day</ion-title>
                    </ion-toolbar>
                </ion-header>
                <RecipeComponent :recipe="recipeOfTheDay" />
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import { Recipe } from "@/api/types";
import { useTasteBuddyStore } from "@/storage";


export default defineComponent({
    title: 'RecipeOfTheDayPage',
    components: {
        RecipeComponent,
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle
    },
    setup() {
        const store = useTasteBuddyStore()
        const recipeOfTheDay: ComputedRef<Recipe> = computed(() => store.getters.getRecipes[0])

        return {
            recipeOfTheDay
        }
    }
});
</script>

<style scoped>
.gradient {
    background: linear-gradient(to bottom, #2F3540 0%, rgba(0, 0, 0, 0) 100%);
}
</style>