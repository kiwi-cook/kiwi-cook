<template>
    <IonPage id="recipe-list-page">

        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :big-text="['Discover', 'new recipes']"/>

                    <!-- Searchbar for ingredients and tools -->
                    <Searchbar v-model="filterInput" :elements="filteredItems" class="item-searchbar"
                               placeholder="What ingredients or recipes are you craving today?">
                        <template #element="{element}">
                            <template v-if="element instanceof Item">
                                <ItemComponent :item="element as Item"
                                               @click="includeItem((element as Item).getId())"/>
                            </template>
                            <template v-if="element instanceof Recipe">
                                {{ (element as Recipe).getName() }}
                            </template>
                        </template>
                    </Searchbar>

                    <section>
                        <h3>
                            Set your preferences
                        </h3>
                        <h4 class="subheader">
                            Filter by ingredients, cooking time, price and more.
                        </h4>
                        <IonAccordionGroup :multiple="true" :value="['items']">
                            <IonAccordion value="items" class="suggestion-filter">
                                <IonItem slot="header">
                                    <IonLabel>
                                        What ingredients do you have?
                                    </IonLabel>
                                </IonItem>
                                <div slot="content" class="ion-padding">
                                    <IonCard>
                                        <IonCardContent>
                                            <!-- Suggested and selected items -->
                                            <List :list="[...selectedItems, ...itemSuggestions]"
                                                  :load-all="true">
                                                <template #element="{ element }">
                                                    <ItemComponent
                                                        :disable-click="true"
                                                        :item="element as Item"
                                                        :include="itemQueries[(element as Item).getId()]">
                                                        <template #end>
                                                            <div class="item-buttons">
                                                                <IonButton
                                                                    :color="itemQueries[(element as Item).getId()] ? 'success' : 'light'"
                                                                    aria-description="Include item"
                                                                    class="item-button"
                                                                    @click="includeItem((element as Item).getId())">
                                                                    <IonIcon :icon="add"/>
                                                                </IonButton>
                                                                <IonButton
                                                                    :color="itemQueries[(element as Item).getId()] === false ? 'danger' : 'light'"
                                                                    aria-description="Exclude item"
                                                                    class="item-button"
                                                                    @click="excludeItem((element as Item).getId())">
                                                                    <IonIcon :icon="remove"/>
                                                                </IonButton>
                                                                <IonButton
                                                                    v-if="typeof itemQueries[(element as Item).getId()] !== 'undefined'"
                                                                    aria-description="Remove item"
                                                                    class="item-button"
                                                                    color="light"
                                                                    @click="removeItem((element as Item).getId())">
                                                                    <IonIcon :icon="trash"
                                                                             @click="removeItem((element as Item).getId())"/>
                                                                </IonButton>
                                                            </div>
                                                        </template>
                                                    </ItemComponent>
                                                </template>
                                            </List>
                                        </IonCardContent>
                                    </IonCard>
                                </div>
                            </IonAccordion>

                            <!-- Cooking time -->
                            <IonAccordion class="suggestion-filter" value="duration">
                                <IonItem slot="header">
                                    <IonLabel>
                                        How much time do you have?
                                    </IonLabel>
                                </IonItem>
                                <div slot="content" class="ion-padding">
                                    <IonCard>
                                        <IonCardContent>
                                            <template v-for="time in cookingTimes" :key="time">
                                                <IonChip :outline="true" class="cooking-time"
                                                         @click="maxCookingTime = time">
                                                    {{ time }} min.
                                                </IonChip>
                                            </template>
                                            <IonChip :outline="true" class="recipe-price"
                                                     @click="maxCookingTime = undefined">
                                                Any duration
                                            </IonChip>
                                            <IonRange v-model="maxCookingTime"
                                                      :label="`${ maxCookingTime ? `${maxCookingTime} min.` : 'Any duration' }`"
                                                      :max="60" :min="5" :pin="true"
                                                      :pin-formatter="(value: number) => `${value} min.`"
                                                      :snaps="true"
                                                      :step="5" :ticks="false"
                                                      label-placement="end"/>
                                        </IonCardContent>
                                    </IonCard>
                                </div>
                            </IonAccordion>

                            <!-- Price -->
                            <IonAccordion class="suggestion-filter" value="price">
                                <IonItem slot="header">
                                    <IonLabel>
                                        What is your budget?
                                    </IonLabel>
                                </IonItem>
                                <div slot="content" class="ion-padding">
                                    <IonCard>
                                        <IonCardContent>
                                            <template v-for="price in prices" :key="price">
                                                <IonChip :outline="true" class="recipe-price"
                                                         @click="maxPrice = price">
                                                    {{ price }} €
                                                </IonChip>
                                            </template>
                                            <IonChip :outline="true" class="recipe-price"
                                                     @click="maxPrice = undefined">
                                                Any price
                                            </IonChip>
                                            <IonRange v-model="maxPrice"
                                                      :label="`${ maxPrice ? `${maxPrice} €` : 'Any price' }`"
                                                      :max="20" :min="1" :pin="true"
                                                      :pin-formatter="(value: number) => `${value} €`"
                                                      :snaps="true"
                                                      :step="1" :ticks="false"
                                                      label-placement="end"/>
                                        </IonCardContent>
                                    </IonCard>
                                </div>
                            </IonAccordion>
                        </IonAccordionGroup>
                    </section>


                    <!-- Suggested recipes -->
                    <template v-if="suggestedRecipes.length > 0">
                        <section>
                            <h3>
                                Recommendations
                            </h3>
                            <h4 class="subheader">
                                Based on your preferences
                            </h4>
                            <List :horizontal="true" :list="suggestedRecipes"
                                  :load-all="true"
                                  :no-wrap="true">
                                <template #element="{ element }">
                                    <div class="mini-recipe-preview">
                                        <MiniRecipePreview :recipe="element as Recipe"/>
                                    </div>
                                </template>
                            </List>
                        </section>
                    </template>

                    <!-- Recipe suggestions -->
                    <template v-if="recipeSuggestions.length > 0 && submitted">
                        <section>
                            <h3>
                                Found {{ recipeSuggestions.length }} recipes
                            </h3>
                            <h4 class="subheader">
                                These recipes match your search
                            </h4>
                            <List :list="recipeSuggestions">
                                <template #element="{ element }">
                                    <RecipeSuggestionPreview :recipe-suggestion="element as RecipeSuggestion"/>
                                </template>
                            </List>
                        </section>
                    </template>
                    <template v-else-if="submitted">
                        <h3>
                            No recipes found
                        </h3>
                    </template>

                    <!-- Submit button -->
                    <div v-if="!submitDisabled" class="search-button-wrapper">
                        <IonButton :color="submitColor" :disabled="submitDisabled" class="search-button"
                                   type="submit" @click="submit()">
                            {{ submitButton }}
                            <IonIcon v-if="!submitted" :icon="search" class="search-button-icon"/>
                        </IonButton>
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {computed, ComputedRef, Ref, ref, watch} from 'vue';
import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonCard,
    IonCardContent,
    IonChip,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonPage,
    IonRange,
} from '@ionic/vue';
import {useRecipeStore} from '@/storage';
import {Item, Recipe, RecipeSuggestion, SearchQueryBuilder, suggestRecipes} from '@/tastebuddy';
import List from "@/components/recipe/List.vue";
import RecipeSuggestionPreview from "@/components/recipe/previews/RecipeSuggestionPreview.vue";
import Searchbar from "@/components/utility/Searchbar.vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import MiniRecipePreview from "@/components/recipe/previews/MiniRecipePreview.vue";
import ItemComponent from "@/components/recipe/Item.vue";
import {add, remove, search, trash} from "ionicons/icons";

const recipeStore = useRecipeStore()

const itemsById = computed(() => recipeStore.getItemsAsMap)
const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))
const recipes = computed(() => recipeStore.getRecipesAsList)
const savedRecipes = computed(() => recipeStore.getSavedRecipes)

/* Suggested recipes */
const suggestedRecipes: ComputedRef<Recipe[]> = computed(() => {
    const suggestedRecipes = [...recipes.value, ...savedRecipes.value]
        .filter(() => Math.random() < 1 / (recipes.value.length * 0.15)).slice(0, 6)
    suggestedRecipes.sort((a: Recipe, b: Recipe) => a.getDuration() - b.getDuration())
    return suggestedRecipes
})

/* Filtered items */
const filteredItems = ref<Item[]>([])
const filterInput = ref('')
watch([filterInput, items], () => {
    let _filteredItems: Item[] = []
    if (filterInput.value === '') {
        _filteredItems = []
    } else {
        _filteredItems = (items.value ?? [])
            .filter((item: Item) => item.getName()
                .toLowerCase().includes((filterInput.value ?? '').toLowerCase()))
            .filter((item: Item) => typeof itemQueries.value[item.getId()] === 'undefined')
    }
    filteredItems.value = _filteredItems.slice(0, 5)
}, {immediate: true})

/* Selected items */
const itemQueries = ref<{ [id: string]: boolean }>({})
const selectedItems = computed<Item[]>(() => Object.keys(itemQueries.value)
    .map((id: string) => itemsById.value[id]))
const includeItem = (id: string) => {
    itemQueries.value[id] = true
}
const excludeItem = (id: string) => {
    itemQueries.value[id] = false
}
const removeItem = (id: string) => {
    delete itemQueries.value[id]
}

/* Items suggestions */
const maxItemSuggestionsLength = 3
const itemSuggestions = computed(() => recipeStore.getItemSuggestions
    .filter((item: Item) => typeof itemQueries.value[item.getId()] === 'undefined')
    .slice(0, maxItemSuggestionsLength)
)

/* City + Price */
const city = ref('')
const prices = [2, 3, 5, 10]
const maxPrice = ref<number | undefined>(undefined)

/* Max cooking time */
const cookingTimes = [5, 10, 20, 45]
const maxCookingTime = ref<number | undefined>(undefined)

/* Recipes suggestions */
const recipeSuggestions: Ref<RecipeSuggestion[]> = ref([])
const suggest = () => {
    const searchQueryBuilder = new SearchQueryBuilder()
    searchQueryBuilder.setCity(city.value)
    searchQueryBuilder.setDuration(maxCookingTime.value)
    searchQueryBuilder.setItemIds(itemQueries.value)
    searchQueryBuilder.setPrice(maxPrice.value)
    const query = searchQueryBuilder.build()
    recipeSuggestions.value = suggestRecipes(query)
}

/* Submit button */
const submitted = ref(false)
const submit = () => {
    if (recipeSuggestions.value.length === 0) {
        // suggest recipes
        submitted.value = true
        suggest()
    } else {
        // reset
        submitted.value = false
        recipeSuggestions.value = []
    }
}
const submitButton = computed<string>(() => recipeSuggestions.value.length === 0 ? 'Suggest Recipes' : 'Reset Suggestions');
const submitColor = computed<string>(() => recipeSuggestions.value.length === 0 ? 'success' : 'danger');
const submitDisabled = computed<boolean>(() => recipeSuggestions.value.length === 0
    && selectedItems.value.length === 0)
</script>

<style scoped>
.item-searchbar {
    margin-bottom: 1rem;
}

section {
    margin-top: var(--margin-s);
    margin-bottom: var(--margin-s);
}

.item-buttons {
    margin-left: var(--margin-medium);
    margin-right: var(--margin-medium);
    display: flex;
}

.item-button {
    margin: 0;
}

.item-button::part(native) {
    border-radius: 0;
    padding: 10px;
}

@media (width <= 414px) {
    .item-button::part(native) {
        padding: 5px;
        font-size: var(--font-size-tiny);
    }
}

.item-buttons .item-button:not(:last-child)::part(native) {
    border-right: none; /* Prevent double borders */
}

.item-buttons .item-button:first-child::part(native) {
    border-right: none; /* Prevent double borders */
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
}

.item-buttons .item-button:last-child::part(native) {
    border-right: none; /* Prevent double borders */
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
}

.cooking-time {
    cursor: pointer;
}

.search-button-wrapper {
    position: fixed;
    width: 70%;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 100;
}

.search-button::part(native) {
    border-radius: var(--border-radius);
    font-weight: bold;
}

.search-button-icon {
    margin-left: 10px;
}

.mini-recipe-preview {
    width: 100%;
    max-width: 200px;
}
</style>