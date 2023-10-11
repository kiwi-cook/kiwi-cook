<template>
    <IonPage>
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

<script setup lang="ts">
import {computed, ref} from 'vue';
import {IonContent, IonPage} from '@ionic/vue';
import FancyHeader from "@/shared/components/utility/fancy/FancyHeader.vue";
import RecipeComponent from '@/shared/components/recipe/Recipe.vue';
import {Recipe} from "@/shared";
import {useRecipeStore, useTasteBuddyStore} from "@/app/storage";

// Get the recipe of the day depending on the day of the year
const recipeStore = useRecipeStore()
const recipeOfTheDay = computed<Recipe>(() => recipeStore.getRecipeOfTheDay)

// Welcome messages
const tasteBuddyStore = useTasteBuddyStore()
const welcomeMessage = ref<string[]>([])
tasteBuddyStore.getGreeting().then((greetings: string[]) => {
    welcomeMessage.value = greetings
}).catch(() => {
    welcomeMessage.value = ['Hello there!']
})
</script>
