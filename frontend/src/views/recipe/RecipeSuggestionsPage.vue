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
                        <ion-card-title color="primary">Select Items</ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <ItemSuggestions :items="items" @select="$event => selectItem($event)" />
                    </ion-card-content>
                    <ion-button color="tertiary" fill="clear" @click="suggest()">Suggest</ion-button>
                </ion-card>

                <ion-card>
                    <ion-card-header>
                        Selected Items
                    </ion-card-header>

                    <ion-card-content>
                        <SmallItemContainer :items="selectedItems" />
                    </ion-card-content>
                </ion-card>

                <RecipeList :recipe-list="recipeSuggestions" />
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { ComputedRef, computed, defineComponent, ref } from 'vue';
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
import ItemSuggestions from '@/components/suggestion/ItemSuggestions.vue';
import { useTasteBuddyStore } from '@/storage';
import { Item, Suggestion } from '@/tastebuddy/types';
import SmallItemContainer from '@/components/item/SmallItemContainer.vue';

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
        ItemSuggestions,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonButton,
        SmallItemContainer
    },
    setup() {
        const store = useTasteBuddyStore()
        const itemsById = computed(() => store.getters.getItemsById)
        const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))

        const filterInput = ref('')

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

        return {
            filterInput,
            selectItem, items, selectedItems,
            suggest, recipeSuggestions
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