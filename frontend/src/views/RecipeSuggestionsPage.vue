<template>
    <IonPage id="recipe-list-page">

        <IonContent :fullscreen="true">
            <div class="content">
                <h1 class="header-title">
                    Discover new recipes
                </h1>

                <ItemSearchbar v-model="filterInput" :filtered-items="filteredItems"
                               placeholder="What ingredients are you craving today?"
                               @select="selectItem($event)">
                </ItemSearchbar>

                <!-- <List v-if="favoriteRecipes.length > 0" :item-list="favoriteRecipes">
                    <template #item="{ item }">
                        <RecipePreview :no-description="true" :recipe="(item as Recipe)"/>
                    </template>
                </List> -->

                <ItemList v-if="suggestedItems.length > 0" :horizontal="true" :items="suggestedItems"
                          @select="selectItem($event)"/>

                <IonCard v-if="selectedItems.length > 0">
                    <IonCardHeader>
                        <IonCardSubtitle>
                            Your ingredients
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
                        <IonInput v-model="city" label="City" label-placement="stacked"
                                  placeholder="Where do you live?"/>
                    </IonCardContent>
                </IonCard>

                <IonCard>
                    <IonCardHeader>
                        <IonCardSubtitle>
                            How long do you want to spend cooking?
                        </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonRange v-model="maxCookingTime" :label="`${maxCookingTime} minutes max. cooking time`"
                                  :max="60" :min="5" :pin="true" :pin-formatter="(value: number) => `${value} min`"
                                  :snaps="true"
                                  :step="5" :ticks="false"
                                  label-placement="end"/>
                    </IonCardContent>
                </IonCard>

                <div class="center">
                    <IonButton :disabled="selectedItems.length === 0" class="search-button" color="primary"
                               type="submit"
                               @click="suggestRecipes()">Search
                    </IonButton>
                </div>

                <IonCard v-if="recipeSuggestions.length > 0">
                    <IonCardHeader>
                        <IonCardTitle>Suggested Recipes</IonCardTitle>
                    </IonCardHeader>
                    <List :item-list="recipeSuggestions" :no-items-message="noRecipesMessage">
                        <template #item="{ item }">
                            <RecipeSuggestionPreview :recipe-suggestion="item as RecipeSuggestion"/>
                        </template>
                    </List>
                </IonCard>

                <IonCard v-if="recipeSuggestions.length > 0">
                    <IonCardHeader>
                        <IonCardTitle>More Recipes</IonCardTitle>
                    </IonCardHeader>
                    <List :item-list="moreRecipes" :no-items-message="noRecipesMessage">
                        <template #item="{ item }">
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
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonInput,
    IonPage,
    IonRange,
} from '@ionic/vue';
import {useTasteBuddyStore} from '@/storage';
import {Item, Recipe, RecipeSuggestion, StepItem} from '@/tastebuddy/types';
import List from "@/components/utility/List.vue";
import RecipePreview from "@/components/recipe/RecipePreview.vue";
import RecipeSuggestionPreview from "@/components/recipe/RecipeSuggestionPreview.vue";
import ItemSearchbar from "@/components/utility/ItemSearchbar.vue";
import ItemList from "@/components/recipe/ItemList.vue";

export default defineComponent({
    name: 'RecipeSuggestionsPage',
    computed: {
        Recipe() {
            return Recipe
        }
    },
    components: {
        ItemList,
        ItemSearchbar,
        RecipeSuggestionPreview,
        RecipePreview,
        List,
        IonInput,
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        IonButton,
        IonRange
    },
    setup() {
        const store = useTasteBuddyStore()
        const itemsById = computed(() => store.getItemsAsMap)
        const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))

        /* Filtered items */
        const filteredItems = ref([] as Item[])
        const filterInput = ref('')
        watch([filterInput, items], () => {
            if (filterInput.value === '') {
                filteredItems.value = []
            } else {
                filteredItems.value = (items.value ?? [])
                    .filter((item: Item) => item.name.toLowerCase().includes((filterInput.value ?? '').toLowerCase()))
                    .filter((item: Item) => !selectedItemIds.has(item.getId()))
            }
        }, {immediate: true})

        /* Selected items */
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

        /* Recipes suggestions */
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

        /* Favorite recipes */
        const favoriteRecipes: ComputedRef<Recipe[]> = computed(() => store.getSavedRecipes.slice(0, 3))

        /* Items suggestions prototype */
        const suggestedItems: Ref<Item[]> = computed(() => {
                return [...new Set(favoriteRecipes.value.flatMap((recipe: Recipe) => (recipe.getItems() ?? [])
                    .map((item: StepItem) => item.narrow(item))))]
                    .slice(0, 3)
            }
        )

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
            favoriteRecipes, suggestedItems,
            /* Recipes */
            moreRecipes
        }
    }
})
;
</script>

<style scoped>
ion-card-title {
    font-size: 1.5rem;
}

.search-button {
    width: 70%;
    max-width: 400px;
}</style>