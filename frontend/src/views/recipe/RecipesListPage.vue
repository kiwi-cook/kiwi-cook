<template>
    <ion-page id="recipe-list-page">
        <ion-header>
            <ion-toolbar color="primary">
                <TasteBuddyLogo size="tiny" with-left-margin slot="start" />
                <ion-title>Recipes</ion-title>
            </ion-toolbar>
            <ion-toolbar color="primary">
                <ion-searchbar v-model="filterInput" :debounce="500" color="secondary" />
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="content">
                <RecipeList :filter="filterInput" />
            </div>
            <ion-fab slot="fixed" horizontal="start" vertical="bottom">
                <ion-fab-button color="tertiary" @click="addRecipe()">
                    New
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
} from '@ionic/vue';
import RecipeList from '@/components/recipe/RecipeList.vue'
import { addOutline, filter } from 'ionicons/icons';
import TasteBuddyLogo from "@/components/general/TasteBuddyLogo.vue";
import { useTasteBuddyStore } from '@/storage';
import { Recipe } from '@/tastebuddy/types';
import { useIonRouter } from '@ionic/vue';

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        TasteBuddyLogo,
        IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar, IonContent, IonFab, IonFabButton,
        RecipeList
    },
    setup() {
        const filterInput = ref('')


        const router = useIonRouter()
        const store = useTasteBuddyStore()
        const isDevMode = computed(() => store.getters.isDevMode)
        const addRecipe = () => {
            if (isDevMode.value) {
                const newRecipeId = Recipe.newRecipe().update(store)._tmpId
                router.push({ name: 'RecipeEditor', params: { id: newRecipeId } })
            }
        }

        return {
            // recipe
            addOutline, addRecipe,
            // filter
            filterInput, filter
        }
    }
});
</script>

<style scoped>
.filter-relevanz-button {
    margin: 2%;
    color: white;
}
</style>