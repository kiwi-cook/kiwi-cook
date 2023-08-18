<template>
    <IonPage id="recipe-of-the-day-page">
        <IonContent v-once :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :bigText="welcomeMessage"/>

                    <template v-if="recipeOfTheDay">
                        <RecipeComponent :recipe="recipeOfTheDay"/>
                    </template>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, Ref, ref} from 'vue';
import {IonContent, IonPage} from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import {Recipe} from "@/tastebuddy";
import {useRecipeStore, useTasteBuddyStore} from "@/storage";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";


export default defineComponent({
    title: 'RecipeOfTheDayPage',
    components: {
        FancyHeader,
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
        const recipeStore = useRecipeStore()
        const recipeOfTheDay: ComputedRef<Recipe> = computed(() =>
            (recipeStore.getRecipesAsList[day % recipeStore.getRecipesAsList.length]))

        // Welcome messages
        const tasteBuddyStore = useTasteBuddyStore()
        const welcomeMessage: Ref<string[]> = ref([])
        tasteBuddyStore.getGreetings().then((greetings: string[]) => {
            welcomeMessage.value = greetings
        }).catch(() => {
            welcomeMessage.value = ['Hello there!']
        })

        return {
            recipeOfTheDay,
            welcomeMessage
        }
    }
});
</script>

<style scoped>
.gradient {
    background: linear-gradient(to bottom, #2F3540 0%, rgba(0, 0, 0, 0) 100%);
}
</style>