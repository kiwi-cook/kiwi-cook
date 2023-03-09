<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Editor</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-toolbar color="primary">
            <ion-searchbar color="secondary" :debounce="100" @ion-change="handleRecipeFilter($event)" />

            <ion-segment value="default" @ion-change="handleSegment($event)">
                <ion-segment-button value="recipes">
                    <ion-label>Recipes</ion-label>
                </ion-segment-button>
                <ion-segment-button value="items">
                    <ion-label>Items</ion-label>
                </ion-segment-button>
            </ion-segment>
        </ion-toolbar>

        <ion-content :fullscreen="true" class="ion-padding">
            <ion-refresher slot="fixed" @ion-refresh="handleRefresh($event)">
                <ion-refresher-content />
            </ion-refresher>

            <!-- Recipe Editor -->
            <ion-accordion-group v-if="segment === 'recipes'" expand="inset">
                <template v-for="(recipe, recipeIndex) in filteredRecipes" :key="recipe._id + recipeIndex">
                    <ion-accordion :value="recipeIndex.toString()">
                        <ion-item slot="header" color="primary">
                            <ion-label color="light">{{ recipe.name }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <RecipeEditor :recipe="recipe" @remove="removeRecipe(recipeIndex)" />
                        </div>
                    </ion-accordion>
                </template>
                <ion-button @click="addNewRecipe()">Add new Recipe</ion-button>
            </ion-accordion-group>

            <!-- Item Editor -->
            <ion-accordion-group v-if="segment === 'items'" expand="inset">
                <template v-for="(item, itemIndex) in items" :key="item._id + itemIndex">
                    <ion-accordion :value="itemIndex.toString()">
                        <ion-item slot="header" color="primary">
                            <ion-label color="light">{{ item.name }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ItemEditor :item="item" />
                        </div>
                    </ion-accordion>
                </template>
            </ion-accordion-group>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { emptyRecipe, Item, Recipe } from '@/api/types';
import RecipeEditor from '@/components/editor/RecipeEditor.vue';
import ItemEditor from '@/components/editor/ItemEditor.vue'
import { useTasteBuddyStore } from '@/storage';
import { IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent, IonPage, IonHeader, IonSearchbar, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonButton } from '@ionic/vue';
import { computed, ComputedRef, defineComponent, Ref, ref, watch } from 'vue';

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent, IonPage, IonHeader, IonSearchbar, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonButton,
        RecipeEditor, ItemEditor
    },
    setup() {
        const store = useTasteBuddyStore()

        // recipes
        const recipes: ComputedRef<Recipe[]> = computed(() => store.getters.getRecipes)
        const filteredRecipes = ref<Recipe[]>(recipes.value)

        // items
        const items: ComputedRef<Item[]> = computed(() => store.getters.getItems)

        // segment
        const segment: Ref<string> = ref('recipes')
        const handleSegment = (event: any) => {
            segment.value = event.detail.value
        }

        const handleRefresh = async (event: any) => {
            store.dispatch('fetchRecipes').then(() => {
                // set timeout to avoid sus behaviour :)
                setTimeout(() => {
                    // 'complete' tells the refresher to close itself
                    event.detail.complete()
                }, 1700)
            })
        }

        watch(recipes, () => {
            filteredRecipes.value = recipes.value

            // update map of recipes to item ids
            store.dispatch('mapRecipeIdsToItemIds')
        })

        const handleRecipeFilter = (event: any) => {
            const query: string = event.target.value.toLowerCase().trim();
            if (query === '') {
                filteredRecipes.value = recipes.value
                return
            }

            filteredRecipes.value = recipes.value.filter(recipe => JSON.stringify(recipe).toLowerCase().includes(query))
        }

        const addNewRecipe = () => {
            recipes.value.push(emptyRecipe)
        }

        const removeRecipe = (index: number) => {
            recipes.value.splice(index, 1)
        }

        return {
            handleRefresh,
            // toolbar
            segment, handleSegment,
            handleRecipeFilter,
            filteredRecipes, addNewRecipe, removeRecipe,
            items
        };
    }
})
</script>