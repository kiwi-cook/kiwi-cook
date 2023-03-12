<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Editor</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-toolbar color="primary">
            <ion-searchbar color="secondary" :debounce="100" @ion-change="handleFilter($event)" />

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
                    <ion-accordion :value="recipe.name">
                        <ion-item slot="header" color="primary">
                            <ion-label color="light">{{ recipe.name }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <RecipeEditor :recipe="recipe" @remove="removeRecipe(recipeIndex)" />
                        </div>
                    </ion-accordion>
                </template>
            </ion-accordion-group>

            <!-- Item Editor -->
            <ion-accordion-group v-if="segment === 'items'" expand="inset">
                <!-- Control panel for items -->
                <ion-card>
                    <ion-card-header>
                        Control panel
                    </ion-card-header>
                    <ion-card-content>
                        <ion-list>
                            <ion-item v-if="filteredItems.length > 0">
                                <ion-button @click="removeItemsWithoutRecipe">Remove items without recipe</ion-button>
                            </ion-item>
                        </ion-list>
                    </ion-card-content>
                </ion-card>

                <template v-for="(item, itemIndex) in filteredItems" :key="item._id + item.name + itemIndex">
                    <ion-accordion :value="itemIndex.toString()">
                        <ion-item slot="header" color="primary">
                            <ion-label color="light">{{ item.name }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ItemEditor :item="item" @remove="removeItem(itemIndex)" />
                        </div>
                    </ion-accordion>
                </template>
            </ion-accordion-group>

            <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                <ion-fab-button @click="addNew()" color="tertiary">
                    <ion-icon :icon="add" color="light" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { emptyItem, emptyRecipe, Item, Recipe } from '@/api/types';
import RecipeEditor from '@/components/editor/RecipeEditor.vue';
import ItemEditor from '@/components/editor/ItemEditor.vue'
import { useTasteBuddyStore } from '@/storage';
import { IonCard, IonCardHeader, IonCardContent, IonList, IonButton, IonFab, IonFabButton, IonIcon, IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent, IonPage, IonHeader, IonSearchbar, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel } from '@ionic/vue';
import { add } from 'ionicons/icons'
import { computed, ComputedRef, defineComponent, Ref, ref, watch } from 'vue';
import { getFromAPI } from '@/api';
import { API_ROUTE } from '@/api/constants';
import { deepCopy } from '@/utility/util';

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonCard, IonCardHeader, IonCardContent, IonList, IonButton, IonFab, IonFabButton, IonIcon, IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent, IonPage, IonHeader, IonSearchbar, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel,
        RecipeEditor, ItemEditor
    },
    setup() {
        const store = useTasteBuddyStore()

        // recipes
        const recipes: ComputedRef<Recipe[]> = computed(() => store.getters.getRecipes)
        const filteredRecipes = ref<Recipe[]>(recipes.value)

        // items
        const items: ComputedRef<Item[]> = computed(() => store.getters.getItems)
        const filteredItems = ref<Item[]>(items.value)

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

        watch(items, () => {
            filteredItems.value = items.value
        })

        const handleFilter = (event: any) => {
            const query: string = event.target.value.toLowerCase().trim();
            if (query === '') {
                filteredRecipes.value = recipes.value
                filteredItems.value = items.value
                return
            }

            filteredRecipes.value = recipes.value.filter(recipe => JSON.stringify(recipe).toLowerCase().includes(query))
            filteredItems.value = items.value.filter(item => JSON.stringify(item).toLowerCase().includes(query))
        }

        const addNewRecipe = () => {
            recipes.value.push(emptyRecipe)
        }

        const removeRecipe = (index: number) => {
            recipes.value.splice(index, 1)
        }

        const addNewItem = () => {
            items.value.push(emptyItem)
        }

        const removeItem = (index: number) => {
            items.value.splice(index, 1)
        }

        // control panel
        const removeItemsWithoutRecipe = () => {
            const removedItems: Item[] = []
            // copy items to avoid mutability side effects
            const tmpItems: Item[] = deepCopy(items.value)
            tmpItems.forEach((item: Item) => {
                if (store.getters.getRecipesByItemId(item._id).length === 0) {
                    removedItems.push(item)
                    // delete item if it has an id
                    if (item._id) {
                        getFromAPI(API_ROUTE.DELETE_ITEM, { formatObject: { ITEM_ID: item._id ?? '' } })
                    }
                    // delete item from items array
                    removeItem(items.value.indexOf(item))
                }
            })
            console.debug('Removed the following items: ' + removedItems.map(item => item.name));
        }

        const addNew = () => {
            switch (segment.value) {
                case 'items':
                    addNewItem()
                    break;
                case 'recipes':
                    addNewRecipe();
                    break;
                default:
                    break;
            }
        }

        return {
            handleRefresh,
            // toolbar
            segment, handleSegment,
            handleFilter,
            addNew,
            // recipes
            filteredRecipes, addNewRecipe, removeRecipe,
            // items
            filteredItems, addNewItem, removeItem, removeItemsWithoutRecipe,
            // icons
            add,
        };
    }
})
</script>