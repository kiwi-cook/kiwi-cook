<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>{{ recipe?.name }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="content">
                <ion-header collapse="condense">
                    <ion-toolbar>
                        <ion-title size="large">{{ recipe?.name }}</ion-title>
                    </ion-toolbar>
                </ion-header>
                <template v-if="recipe">
                    <RecipeComponent :recipe="recipe"/>
                </template>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent} from 'vue';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import {useTasteBuddyStore} from "@/storage";
import {useRoute} from 'vue-router';
import {Recipe} from '@/api/types';


export default defineComponent({
    title: 'RecipeOfTheDayPage',
    components: {
        RecipeComponent,
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle
    },
    setup() {
        const route = useRoute()
        const recipeId: ComputedRef<string> = computed(() => (route.params.id ?? '') as string)

        const store = useTasteBuddyStore()
        const recipe: ComputedRef<Recipe> = computed(() => store.getters.getRecipesById[recipeId.value])
        return {
            recipe
        }
    }
});
</script>

<style scoped>
.gradient {
    background: linear-gradient(to bottom, #2F3540 0%, rgba(0, 0, 0, 0) 100%);
}
</style>