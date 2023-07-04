<template>
    <IonPage id="recipe-list-page">
        <IonHeader>
            <IonToolbar color="primary">
                <TasteBuddyLogo slot="start" size="tiny" with-left-margin/>
                <IonTitle>Suggestions</IonTitle>
            </IonToolbar>
            <IonToolbar color="primary">
                <IonSearchbar v-model="filterInput" :debounce="500" color="secondary"/>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <div class="content">
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle color="primary">Ingredients and Tools</IonCardTitle>
                    </IonCardHeader>

                    <IonCardContent>
                        <TwoColumnLayout>
                            <template #left>
                                <ItemList key="ingredient" :items="filteredItems" :type="['ingredient']"
                                          @select="selectItem($event)"/>
                            </template>
                            <template #right>
                                <ItemList key="tool" :items="filteredItems" :type="['tool']"
                                          @select="selectItem($event)"/>
                            </template>
                        </TwoColumnLayout>

                        <IonInput v-model="city" placeholder="e.g. Tuebingen" color="primary" label="City"
                                  label-placement="floating"/>
                    </IonCardContent>
                    <IonButton color="tertiary" fill="clear" @click="suggestRecipes()" :disabled="selectedItems.length === 0">Suggest</IonButton>
                </IonCard>

                <IonCard>
                    <IonCardHeader>
                        Selected Items
                    </IonCardHeader>

                    <IonCardContent>
                        <ItemList :items="selectedItems" @select="selectItem($event)"/>
                    </IonCardContent>
                </IonCard>

                <IonCard>
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
    IonInput,
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
import {useTasteBuddyStore} from '@/storage';
import {Item, Recipe, RecipeSuggestion} from '@/tastebuddy/types';
import ItemList from '@/components/recipe/ItemList.vue';
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";
import List from "@/components/utility/List.vue";
import RecipePreview from "@/components/recipe/RecipePreview.vue";
import RecipeSuggestionPreview from "@/components/recipe/RecipeSuggestionPreview.vue";

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        RecipeSuggestionPreview,
        RecipePreview,
        List,
        TwoColumnLayout,
        TasteBuddyLogo,
        IonHeader,
        IonInput,
        IonPage,
        IonSearchbar,
        IonTitle,
        IonToolbar,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonButton,
        ItemList
    },
    setup() {
        const store = useTasteBuddyStore()
        const itemsById = computed(() => store.getItemsAsMap)
        const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))

        const filteredItems = ref([] as Item[])
        const filterInput = ref('')
        watch([filterInput, items], () => {
            if (filterInput.value === '') {
                filteredItems.value = items.value
            } else {
                filteredItems.value = (items.value ?? [])
                    .filter(item => item.name.toLowerCase().includes(filterInput.value.toLowerCase()))
            }
        }, {immediate: true})

        /* Selected Items */
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

        /* Recipes Suggestion */
        const city = ref('')
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
            city,
            RecipeSuggestion, suggestRecipes, recipeSuggestions, noRecipesMessage,
            /* Recipes */
            moreRecipes
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