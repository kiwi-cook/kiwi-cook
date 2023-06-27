<template>
    <IonPage id="recipe-list-page">
        <IonHeader>
            <IonToolbar color="primary">
                <TasteBuddyLogo slot="start" size="tiny" with-left-margin/>
                <IonTitle>Recipes</IonTitle>
            </IonToolbar>
            <IonToolbar color="primary">
                <IonSearchbar v-model="filterInput" :debounce="500" color="secondary"/>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <div class="content">
                <RecipeList :filter="filterInput"/>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton v-if="isDevMode" color="tertiary" @click="addRecipe()">
                    New
                </IonFabButton>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    useIonRouter
} from '@ionic/vue';
import RecipeList from '@/components/recipe/RecipeList.vue'
import {addOutline, filter} from 'ionicons/icons';
import TasteBuddyLogo from "@/components/general/TasteBuddyLogo.vue";
import {useTasteBuddyStore} from '@/storage';
import {Recipe} from '@/tastebuddy/types';

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
        const isDevMode = computed(() => store.isDevMode)
        const addRecipe = () => {
            if (isDevMode.value) {
                const newRecipeId = Recipe.newRecipe().update(store)._tmpId
                router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
            }
        }

        return {
            // recipe
            addOutline, addRecipe, isDevMode,
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