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
                        <IonCardTitle color="primary">Items</IonCardTitle>
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
                    </IonCardContent>
                    <IonButton color="tertiary" fill="clear" @click="suggestRecipes()">Suggest</IonButton>
                </IonCard>

                <IonCard>
                    <IonCardHeader>
                        Selected Items
                    </IonCardHeader>

                    <IonCardContent>
                        <ItemList :items="selectedItems" @select="selectItem($event)"/>
                    </IonCardContent>
                </IonCard>

                <RecipeList :no-recipes-message="noRecipesMessage" :recipe-list="recipeSuggestions"/>
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
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
} from '@ionic/vue';
import TasteBuddyLogo from "@/components/general/TasteBuddyLogo.vue";
import RecipeList from "@/components/recipe/RecipeList.vue";
import {useTasteBuddyStore} from '@/storage';
import {Item, Recipe, Suggestion} from '@/tastebuddy/types';
import ItemList from '@/components/recipe/ItemList.vue';
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        TwoColumnLayout,
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
        const itemsById = computed(() => store.getItemsById)
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

        const recipeSuggestions: Ref<Recipe[]> = ref([])
        const suggestRecipes = () => Suggestion.suggestRecipes(store, Array.from(selectedItemIds))
            .then((recipes: Recipe[]) => recipeSuggestions.value = recipes)
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
            suggestRecipes, recipeSuggestions, noRecipesMessage
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