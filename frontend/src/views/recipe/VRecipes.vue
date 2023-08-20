<template>
    <IonPage id="recipe-list-page">
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <h1>
                        All recipes
                    </h1>

                    <IonSearchbar v-model="filterInput" :debounce="500"/>

                    <List :filter="filterInput" :list="recipes">
                        <template #element="{ element }">
                            <RecipePreview :recipe="element as Recipe"/>
                        </template>
                    </List>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {IonContent, IonPage, IonSearchbar} from '@ionic/vue';
import {filter} from 'ionicons/icons';
import {useRecipeStore} from '@/storage';
import RecipePreview from "@/components/recipe/previews/RecipePreview.vue";
import List from "@/components/recipe/List.vue";

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        RecipePreview, List, IonPage, IonSearchbar, IonContent
    },
    setup() {
        const filterInput = ref('')

        const recipeStore = useRecipeStore()
        const recipes = computed(() => recipeStore.getRecipesAsList)

        return {
            // recipe
            recipes,
            // filter
            filterInput, filter
        }
    }
});
</script>
