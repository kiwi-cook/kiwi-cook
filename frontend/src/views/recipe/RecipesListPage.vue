<template>
    <IonPage id="recipe-list-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <h1 class="header-title">
                    All recipes
                </h1>

                <IonSearchbar v-model="filterInput" :debounce="500" />

                <List :item-list="recipes" :filter="filterInput">
                    <template #item="{item}">
                        <RecipePreview :recipe="item"/>
                    </template>
                </List>
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
import {IonContent, IonFab, IonFabButton, IonPage, IonSearchbar, useIonRouter} from '@ionic/vue';
import {addOutline, filter} from 'ionicons/icons';
import {useTasteBuddyStore} from '@/storage';
import {Recipe} from '@/tastebuddy/types';
import List from "@/components/utility/List.vue";
import RecipePreview from "@/components/recipe/RecipePreview.vue";

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        RecipePreview, List, IonPage, IonSearchbar, IonContent, IonFab, IonFabButton,
    },
    setup() {
        const filterInput = ref('')

        const router = useIonRouter()
        const store = useTasteBuddyStore()
        const recipes = computed(() => store.getRecipesAsList)
        const isDevMode = computed(() => store.isDevMode)
        const addRecipe = () => {
            if (isDevMode.value) {
                const newRecipeId = Recipe.newRecipe().update(store)._tmpId
                router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
            }
        }

        return {
            // recipe
            recipes, addOutline, addRecipe, isDevMode,
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