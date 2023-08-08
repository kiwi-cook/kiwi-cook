<template>
    <IonPage id="recipe-of-the-day-page">
        <IonContent v-once :fullscreen="true">
            <div class="page">
                <div class="content">
                    <h1>
                        {{ welcomeMessage[0] }} <span v-if="welcomeMessage.length > 1"
                                                      class="welcome-msg-highlight">{{ welcomeMessage[1] }}!</span>
                    </h1>

                    <template v-if="recipeOfTheDay">
                        <RecipeComponent :recipe="recipeOfTheDay"/>
                    </template>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent} from 'vue';
import {IonContent, IonPage} from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import {Recipe} from "@/tastebuddy";
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

        // Welcome messages
        const welcomeMessages = [
            ['Greetings,', 'Master of Flavors'],
            ['Hey there,', 'Culinary Artist'],
            ['Hello,', 'Foodie'],
            ['Hi,', 'Chef'],
            ['Let\'s get', 'cooking'],
            ['Hiya,', 'Kitchen Genius'],
            ['Hello,', 'Food Lover'],
            ['Hey,', 'Culinary Connoisseur'],
            ['Greetings,', 'Gastronomic Guru'],
            ['Hi there,', 'Epicurean Expert'],
            ['Hello,', 'Culinary Devotee'],
            ['Hey,', 'Flavor Aficionado'],
            ['Hi,', 'Culinary Enthusiast'],
            ['Hello there,', 'Dining Dynamo'],
            ['Hey there,', 'Taste Trailblazer'],
            ['Hi,', 'Kitchen Aficionado'],
            ['Hello,', 'Culinary Connoisseur'],
            ['Hey,', 'Foodie'],
            ['Hiya,', 'Culinary Artist'],
            ['Hello,', 'Master of Flavors'],
        ]
        const welcomeMessage: ComputedRef<string[]> = computed(() =>
            welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)])

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

.welcome-msg-highlight {
    color: #8CC84B;
}
</style>