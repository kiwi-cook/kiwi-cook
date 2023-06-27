<template>
    <ion-page id="recipe-list-page">
        <ion-header>
            <ion-toolbar color="primary">
                <TasteBuddyLogo size="tiny" with-left-margin slot="start" />
                <ion-title>Suggestions</ion-title>
            </ion-toolbar>
            <ion-toolbar color="primary">
                <ion-searchbar v-model="filterInput" :debounce="500" color="secondary" />
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="content">
                <ion-card>
                    <ion-card-header>
                        <ion-card-title color="primary">Items</ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <ItemList :items="filteredItems" @select="$event => selectItem($event)" />
                    </ion-card-content>
                    <ion-button color="tertiary" fill="clear" @click="suggest()">Suggest</ion-button>
                </ion-card>

                <ion-card>
                    <ion-card-header>
                        Selected Items
                    </ion-card-header>

                    <ion-card-content>
                        <ItemList :items="selectedItems" @select="$event => selectItem($event)" />
                    </ion-card-content>
                </ion-card>

                <RecipeList :recipe-list="recipeSuggestions" :no-recipes-message="noRecipesMessage" />
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { ComputedRef, computed, defineComponent, ref, watch } from 'vue';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
} from '@ionic/vue';
import TasteBuddyLogo from "@/components/general/TasteBuddyLogo.vue";
import RecipeList from "@/components/recipe/RecipeList.vue";
import { useTasteBuddyStore } from '@/storage';
import { Item, Suggestion } from '@/tastebuddy/types';
import ItemList from '@/components/recipe/ItemList.vue';
import { filter } from 'ionicons/icons';

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        TasteBuddyLogo,
        IonHeader,
        IonPage,
        IonSearchbar,
        IonTitle,
        IonToolbar,
        IonContent,
        RecipeList,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonButton,
        ItemList
    },
    setup() {
        const store = useTasteBuddyStore()
        const itemsById = computed(() => store.getters.getItemsById)
        const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))

        const filteredItems = ref([] as Item[])
        const filterInput = ref('')
        watch([filterInput, items], () => {
            if (filterInput.value === '') {
                filteredItems.value = items.value
            } else {
                filteredItems.value = (items.value ?? []).filter(item => item.name.toLowerCase().includes(filterInput.value.toLowerCase()))
            }
        }, { immediate: true })

        const selectedItemIds = new Set<string>()
        const selectedItems = ref([] as Item[])
        const selectItem = (itemID: string) => {
            if (selectedItemIds.has(itemID)) {
                selectedItemIds.delete(itemID)
            } else {
                selectedItemIds.add(itemID)
            }
            selectedItems.value = Array.from(selectedItemIds).map(id => itemsById.value[id])
        }

        const suggest = () => Suggestion.suggestRecipes(store, Array.from(selectedItemIds))
        const recipeSuggestions = computed(() => store.getters.getRecipeSuggestions)
        const noRecipesMessage = computed(() => {
            if (selectedItems.value.length === 0) {
                return 'Select items'
            } else {
                return 'No recipes found'
            }
        })

        return {
            filterInput,
            selectItem, filteredItems, selectedItems,
            suggest, recipeSuggestions, noRecipesMessage
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