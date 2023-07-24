<template>
    <IonPage id="recipe-of-the-day-page">
        <IonContent v-once :fullscreen="true">
            <div class="content">
                <h1 class="header-title">Welcome</h1>

                <template v-if="recipeOfTheDay">
                    <RecipeComponent :recipe="recipeOfTheDay"/>
                </template>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent} from 'vue';
import {IonContent, IonPage} from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import {Recipe} from "@/tastebuddy/types";
import {useRecipeStore} from "@/storage";


export default defineComponent({
    title: 'RecipeOfTheDayPage',
    components: {
        RecipeComponent,
        IonPage, IonContent,
    },
    setup() {
        // Calculate the day of the year
        const now: Date = new Date();
        const start: Date = new Date(now.getFullYear(), 0, 0);
        const diff: number = (now.getTime() - start.getTime()) +
            ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay: number = 1000 * 60 * 60 * 24;
        const day: number = Math.floor(diff / oneDay);

        // Get the recipe of the day depending on the day of the year
        const store = useRecipeStore()
        const recipeOfTheDay: ComputedRef<Recipe> = computed(() =>
            (store.getRecipesAsList[day % store.getRecipesAsList.length]))

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