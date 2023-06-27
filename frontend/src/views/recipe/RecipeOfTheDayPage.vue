<template>
    <IonPage id="recipe-of-the-day-page">
        <IonHeader>
            <IonToolbar color="primary">
                <TasteBuddyLogo slot="start" size="tiny" with-left-margin/>
                <IonTitle>Recipe of the Day</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent v-once :fullscreen="true">
            <div class="content">
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Recipe of the Day</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <template v-if="recipeOfTheDay">
                    <RecipeComponent :recipe="recipeOfTheDay"/>
                </template>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent} from 'vue';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import {Recipe} from "@/tastebuddy/types";
import {useTasteBuddyStore} from "@/storage";
import TasteBuddyLogo from "@/components/general/TasteBuddyLogo.vue";


export default defineComponent({
    title: 'RecipeOfTheDayPage',
    components: {
        TasteBuddyLogo,
        RecipeComponent,
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle
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
        const store = useTasteBuddyStore()
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