<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <div class="content-margin">
                        <Header :big-text="$t('Suggestions.Title').split(';')"
                                :small-text="$t('Suggestions.Subtitle')"/>
                    </div>

                    <div class="sticky-header">
                        <div class="content-margin">
                            <!-- Searchbar for ingredients, tools, recipes and tags -->
                            <SmartSearchbar v-model:state="searchbarOpen" class="searchbar" @search="search($event)"/>
                        </div>
                    </div>


                    <div class="content-margin">
                        <article>
                            <BigRecipePreview v-if="recipeOfTheDay" :recipe="recipeOfTheDay"
                                              :title="t('RecipeOfTheDay.Title')"/>
                        </article>

                        <!-- Predicted/Recommended recipes -->
                        <section v-if="predictedRecipes.length > 0">
                            <h3>
                                {{ predictedRecipes.length }}
                                {{ $t('Suggestions.Recommendations.Title', predictedRecipes.length) }}
                            </h3>
                            <h4 class="subheader">
                                {{ $t('Suggestions.Recommendations.Subtitle') }}
                            </h4>
                            <HorizontalList :list="predictedRecipes">
                                <template #element="{ element }: { element: Recipe}">
                                    <MiniRecipePreview :key="element.id" :duration="element.getDuration()"
                                                       :img-url="element.props.imgUrl"
                                                       :link="element.getRoute()"
                                                       :name="element.getName()"/>
                                </template>
                            </HorizontalList>
                        </section>

                        <!-- Random recipes -->
                        <section v-if="randomRecipes.length > 0">
                            <h3>
                                {{ $t('Suggestions.Random.Title') }}
                            </h3>
                            <h4 class="subheader">
                                {{ $t('Suggestions.Random.Subtitle') }}
                            </h4>
                            <HorizontalList :list="randomRecipes">
                                <template #element="{ element }: { element: Recipe}">
                                    <MiniRecipePreview :key="element.id" :duration="element.getDuration()"
                                                       :img-url="element.props.imgUrl"
                                                       :link="element.getRoute()"
                                                       :name="element.getName()"/>
                                </template>
                            </HorizontalList>
                        </section>

                        <!-- Searched recipes -->
                        <a id="recipe-search" ref="recipeSearchAnchor"/>
                        <section v-if="submitted">
                            <div v-if="searchedRecipes.length > 0">
                                <h3>
                                    {{ $t('Suggestions.Search.Title', [searchedRecipes.length]) }}
                                </h3>
                                <h4 class="subheader">
                                    {{ $t('Suggestions.Search.Subtitle') }}
                                </h4>
                                <List :list="searchedRecipes">
                                    <template #element="{ element }">
                                        <RecipePreview :key="element.id" :recipe="element as RecipeSuggestion"/>
                                    </template>
                                </List>
                            </div>
                            <div v-else>
                                <h3>
                                    {{ $t('Suggestions.Search.NoRecipesFound') }}
                                </h3>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <!-- Fab timer -->
            <FabTimer/>
            <IonFab slot="fixed" horizontal="end" vertical="bottom">
                <!-- Open and close search -->
                <IonFabButton v-if="!searchbarOpen" class="search-button search" @click="openSearchbar()">
                    <IonIcon :icon="searchOutline"/>
                </IonFabButton>
                <IonFabButton v-else class="search-button close" @click="searchbarOpen = false">
                    <IonIcon :icon="closeOutline"/>
                </IonFabButton>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { IonContent, IonFab, IonFabButton, IonIcon, IonPage } from '@ionic/vue';
import { useRecipeStore } from '@/app/storage';
import { FabTimer, Recipe } from '@/shared';
import Header from '@/shared/components/utility/header/Header.vue';
import MiniRecipePreview from '@/app/components/recipe/previews/MiniRecipePreview.vue';
import HorizontalList from '@/shared/components/utility/list/HorizontalList.vue';
import List from '@/shared/components/utility/list/List.vue';
import { useI18n } from 'vue-i18n';
import RecipePreview from '@/app/components/recipe/previews/RecipePreview.vue';
import BigRecipePreview from '@/app/components/recipe/previews/BigRecipePreview.vue';
import { RecipeSuggestion } from '@/app/search';
import { SmartSearchbar } from '@/app/components/search';
import { closeOutline, searchOutline } from 'ionicons/icons';

const {t} = useI18n()
const recipeStore = useRecipeStore()

const recipeOfTheDay = computed<Recipe>(() => recipeStore.getRecipeOfTheDay)
const recipes = computed(() => recipeStore.getRecipesAsList)

const SUGGESTION_CONFIG = {
    maxRandomRecipes: 15, maxPredictedRecipes: 15,
}

// Recipe suggestions
/* Random recipes */
const randomRecipes = computed<Recipe[]>(() => {
    return [...recipes.value]
        .filter(() => Math.random() < 1 / (recipes.value.length * 0.1))
        .slice(0, SUGGESTION_CONFIG.maxRandomRecipes)
        .toSorted((a: Recipe, b: Recipe) => a.getDuration() - b.getDuration())
})

/* Recipe suggestions */
const predictedRecipes = computed<Recipe[]>(() => recipeStore.getRecipePredictions)

/* Submit button */
const recipeSearchAnchor = ref<HTMLAnchorElement | null>(null)
const submitted = ref(false)
const searchedRecipes = ref<RecipeSuggestion[]>([])
const searchbarOpen = ref(false)
const openSearchbar = () => {
    searchbarOpen.value = true
}
const search = (result: RecipeSuggestion[]) => {
    // suggest recipes
    submitted.value = true
    searchedRecipes.value = result
    setTimeout(() => {
        recipeSearchAnchor.value?.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'})
    }, 50)
}
</script>

<style scoped>
.searchbar {
    margin-bottom: 1rem;
}

section {
    margin-top: var(--margin-s);
    margin-bottom: var(--margin-s);
}

.item-buttons {
    display: flex;
}

.item-button {
    margin: 0;
    font-size: var(--font-size-smaller);
}

.item-button::part(native) {
    border-radius: 0;
    padding: 3px 12px;
}

@media (width <= 414px) {
    .item-button::part(native) {
        padding: 2px 8px;
    }
}

@media (width <= 350px) {
    .item-button::part(native) {
        padding: 1px 4px;
    }
}

.item-buttons .item-button:not(:last-child)::part(native) {
    border-right: none;
    /* Prevent double borders */
}

.item-buttons .item-button:first-child::part(native) {
    border-right: none;
    /* Prevent double borders */
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
}

.item-buttons .item-button:last-child::part(native) {
    border-right: none;
    /* Prevent double borders */
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
}

.cooking-time {
    cursor: pointer;
}

#recipe-search {
    scroll-margin-top: 500px;
}

@keyframes liquidGradient {
    0% {
        background-position: 0 50%
    }
    25% {
        background-position: 50% 75%
    }
    50% {
        background-position: 100% 100%
    }
    75% {
        background-position: 50% 75%
    }
    100% {
        background-position: 0 50%
    }
}

.search-button::part(native) {
    /* Basic styling */
    display: inline-block;
    font-size: 16px;
    font-weight: var(--font-weight-bold);

    text-align: center;
    text-decoration: none;
    border: none;
    border-radius: 50px;
    cursor: pointer;

    /* Colors and shadows */
    text-shadow: 1px 1px 2px #fff;
    box-shadow: var(--box-shadow2);

    color: #fff;
    background-size: 400% 400%; /* Increase background size for the gradient animation */

    /* Animations */
    transition: background 3s ease-in-out,
    transform ease-in-out 300ms,
    box-shadow ease-in-out 300ms,
    scale ease-in-out 300ms;
}

.search-button.search::part(native) {
    background: radial-gradient(circle at top left, #ffc718, #c362b5, #6ab1e1),
    linear-gradient(45deg, #62c370, #c362b5, #6ab1e1),
    radial-gradient(circle at bottom right, #62c370, #c362b5, #ffc718),
    linear-gradient(135deg, #ffc718, #62c370, #c362b5, #6ab1e1);

    /* Animations */
    animation: liquidGradient 5s infinite ease-in-out; /* Apply the liquid gradient animation */
}

.search-button.close::part(native) {
    background: radial-gradient(circle at top left, #ff0000, #c362b5, #6ab1e1),
    linear-gradient(45deg, #ff0000, #c362b5, #6ab1e1),
    radial-gradient(circle at bottom right, #ff0000, #c362b5, #ffc718),
    linear-gradient(135deg, #ffc718, #ff0000, #c362b5, #6ab1e1);
}

.search-button::part(native):hover, .search-button::part(native):active {
    /* Hover effects */
    box-shadow: 0 30px 20px -15px rgba(0, 0, 0, 0.2);
    text-shadow: none;
    scale: 1.05;
}
</style>