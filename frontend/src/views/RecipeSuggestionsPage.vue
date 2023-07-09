<template>
    <IonPage id="recipe-list-page">
        <IonHeader>
            <IonToolbar color="primary">
                <IonTitle>Find Recipes</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <div class="content">
                <ItemSearchbar v-model="filterInput" :filtered-items="filteredItems" @select="selectItem($event)"
                               placeholder="What ingredient are you craving today?">
                </ItemSearchbar>

                <IonCard>
                    <IonCardHeader>
                        <IonCardSubtitle>
                            Search for ingredients in your pantry
                        </IonCardSubtitle>
                    </IonCardHeader>

                    <IonCardContent>
                        <ItemList :items="selectedItems" @select="selectItem($event)"/>
                    </IonCardContent>
                </IonCard>

                <IonCard>
                    <IonCardHeader>
                        <IonCardSubtitle>
                            Find the best ingredient prices near you!
                        </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonInput v-model="city" placeholder="Where do you live?" color="primary" label="City"
                                  label-placement="stacked"/>
                    </IonCardContent>
                </IonCard>

                <IonCard>
                    <IonCardHeader>
                        <IonCardSubtitle>
                            How long do you want to spend cooking?
                        </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonRange v-model="maxCookingTime" color="primary" label="Cooking Time (minutes)" :snaps="true"
                                  :min="0" :max="60" :step="10" :pin="true"
                                  :pin-formatter="(value: number) => `${value} min`"
                                  :ticks="false" label-placement="end"/>
                    </IonCardContent>
                </IonCard>

                <div class="center">
                    <IonButton color="tertiary" @click="suggestRecipes()" class="search-button" type="submit"
                               :disabled="selectedItems.length === 0">Search
                    </IonButton>
                </div>

                <IonCard v-if="recipeSuggestions.length > 0">
                    <IonCardHeader>
                        <IonCardTitle color="primary">Suggested Recipes</IonCardTitle>
                    </IonCardHeader>
                    <List :no-items-message="noRecipesMessage" :item-list="recipeSuggestions">
                        <template #item="{item}">
                            <RecipeSuggestionPreview :recipe-suggestion="item as RecipeSuggestion"/>
                        </template>
                    </List>
                </IonCard>

                <IonCard v-if="recipeSuggestions.length > 0">
                    <IonCardHeader>
                        <IonCardTitle color="primary">More Recipes</IonCardTitle>
                    </IonCardHeader>
                    <List :no-items-message="noRecipesMessage" :item-list="moreRecipes">
                        <template #item="{item}">
                            <RecipePreview :recipe="item as Recipe"/>
                        </template>
                    </List>
                </IonCard>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, Ref, ref, watch} from 'vue';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonInput,
    IonPage,
    IonRange,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {useTasteBuddyStore} from '@/storage';
import {Item, Recipe, RecipeSuggestion} from '@/tastebuddy/types';
import List from "@/components/utility/List.vue";
import RecipePreview from "@/components/recipe/RecipePreview.vue";
import RecipeSuggestionPreview from "@/components/recipe/RecipeSuggestionPreview.vue";
import ItemSearchbar from "@/components/utility/ItemSearchbar.vue";
import ItemList from "@/components/recipe/ItemList.vue";

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        ItemList,
        ItemSearchbar,
        RecipeSuggestionPreview,
        RecipePreview,
        List,
        IonHeader,
        IonInput,
        IonPage,
        IonTitle,
        IonToolbar,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonButton,
        IonRange
    },
    setup() {
        const store = useTasteBuddyStore()
        const itemsById = computed(() => store.getItemsAsMap)
        const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))

        const filteredItems = ref([] as Item[])
        const filterInput = ref('')
        watch([filterInput, items], () => {
            if (filterInput.value === '') {
                filteredItems.value = []
            } else {
                filteredItems.value = (items.value ?? [])
                    .filter(item => item.name.toLowerCase().includes(filterInput.value.toLowerCase()))
                    .filter(item => !selectedItemIds.has(item.getId()))
            }
        }, {immediate: true})

        /* Selected Items */
        const selectedItemIds = new Set<string>()
        const selectedItems = ref([] as Item[])
        const selectItem = (itemID: string) => {
            if (selectedItemIds.has(itemID)) {
                selectedItemIds.delete(itemID)
            } else {
                filterInput.value = ''
                selectedItemIds.add(itemID)
            }
            selectedItems.value = Array.from(selectedItemIds).map(id => itemsById.value[id])
        }

        /* Recipes Suggestion */
        const city = ref('')
        const maxCookingTime = ref(15)
        const recipeSuggestions: Ref<RecipeSuggestion[]> = ref([])
        const suggestRecipes = () => RecipeSuggestion.suggestRecipes(store, Array.from(selectedItemIds), city.value)
            .then((fetchedRecipeSuggestions: RecipeSuggestion[]) => recipeSuggestions.value = fetchedRecipeSuggestions)
        const noRecipesMessage = computed(() => {
            if (selectedItems.value.length === 0) {
                return 'Select items'
            } else {
                return 'No recipes found'
            }
        })

        /* Recipes */
        const moreRecipes = computed(() => store.getRecipesAsList
            .filter((recipe: Recipe) => recipeSuggestions.value
                .every((suggestion: RecipeSuggestion) => suggestion.getRecipe().getId() !== recipe.getId())))

        return {
            filterInput,
            /* Items */
            selectItem, filteredItems, selectedItems,
            /* Suggestions */
            city, maxCookingTime,
            RecipeSuggestion, suggestRecipes, recipeSuggestions, noRecipesMessage,
            /* Recipes */
            moreRecipes
        }
    }
});
</script>

<style scoped>
ion-card-title {
    font-size: 1.5rem;
}

.search-button {
    width: 70%;
    max-width: 400px;
}
</style>