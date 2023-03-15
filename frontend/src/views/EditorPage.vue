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
                <template v-for="recipe in filteredRecipes" :key="recipe._id ?? recipe._tmpId">
                    <ion-accordion :value="recipe._id ?? recipe._tmpId">
                        <ion-item slot="header" color="primary">
                            <ion-label color="light">{{ recipe.name }}</ion-label>
                            <ion-chip color="light" v-if="recipe._id || recipe._tmpId">
                                {{ recipe._id ?? recipe._tmpId }}
                            </ion-chip>
                        </ion-item>
                        <div slot="content">
                            <RecipeEditor :recipe="recipe" />
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

                <template v-for="item in filteredItems" :key="item.getId()">
                    <ion-accordion :value="item.getId()">
                        <ion-item slot="header" color="primary">
                            <ion-label color="light">{{ item.name }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <ItemEditor :item="item" />
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
import { Item, Recipe } from '@/api/types';
import RecipeEditor from '@/components/editor/RecipeEditor.vue';
import ItemEditor from '@/components/editor/ItemEditor.vue'
import { useTasteBuddyStore } from '@/storage';
import { IonChip, IonCard, IonCardHeader, IonCardContent, IonList, IonButton, IonFab, IonFabButton, IonIcon, IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent, IonPage, IonHeader, IonSearchbar, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel } from '@ionic/vue';
import { add } from 'ionicons/icons'
import { computed, ComputedRef, defineComponent, onMounted, Ref, ref, watch } from 'vue';

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonChip, IonCard, IonCardHeader, IonCardContent, IonList, IonButton, IonFab, IonFabButton, IonIcon, IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent, IonPage, IonHeader, IonSearchbar, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel,
        RecipeEditor, ItemEditor
    },
    setup() {
        const store = useTasteBuddyStore()

        // recipes
        const recipes: ComputedRef<Recipe[]> = computed(() => store.getters.getRecipes)
        const filteredRecipes = ref<Recipe[]>(recipes.value)
        const addRecipe = () => Recipe.newRecipe().update(store)

        // items
        const items: ComputedRef<Item[]> = computed(() => store.getters.getItems)
        const filteredItems = ref<Item[]>(items.value)
        const addItem = () => Item.newItem().update(store)

        // control panel
        const removeItemsWithoutRecipe = async () => {
            const itemsToDelete = items.value.filter(item => store.getters.getRecipesByItemId(item._id).length === 0)
            itemsToDelete.forEach(item => async () => {
                await store.dispatch('deleteItem', item._id)
            })
        }

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
        }, { deep: true })

        watch(items, () => {
            filteredItems.value = items.value
        }, { deep: true })

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

        const handleSave = (event: any) => {
            if (!(event.keyCode === 83 && (event.ctrlKey || event.metaKey))) {
                return;
            }

            event.preventDefault();
            if (segment.value === 'recipes') {
                // save only recipes that are not new
                console.log(filteredRecipes.value);
                filteredRecipes.value.filter(recipe => typeof recipe._tmpId === 'undefined').forEach(recipe => recipe.update(store).save(store))
            }
        }

        onMounted(() => {
            document.addEventListener("keydown", handleSave, false);
        })


        const addNew = () => {
            switch (segment.value) {
                case 'items':
                    addItem()
                    break;
                case 'recipes':
                    addRecipe();
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
            filteredRecipes,
            // items
            filteredItems, removeItemsWithoutRecipe,
            // icons
            add,
        };
    }
})
</script>