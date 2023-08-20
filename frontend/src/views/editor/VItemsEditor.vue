<template>
    <IonPage id="items-editor-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <FancyHeader :big-text="['Items', 'Editor']" />

                <IonSearchbar v-model="filterInput" :debounce="500"/>
                <IonButton @click="removeUnusedItems()">Remove unused items</IonButton>
                <IonButton @click="addItem()">Add Item</IonButton>

                <List :filter="filterInput" :list="items">
                    <template #element="{element}">
                        <ItemEditor :item="element as Item"/>
                    </template>
                </List>
            </div>

            <!-- Buttons -->
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton>
                    <IonIcon :icon="chevronForwardCircle"/>
                </IonFabButton>
                <IonFabList side="end">
                    <IonFabButton @click="addItem()">
                        <IonIcon :icon="addOutline"/>
                    </IonFabButton>
                    <IonFabButton @click="saveItems()">
                        <IonIcon :icon="saveOutline"/>
                    </IonFabButton>
                </IonFabList>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, ref} from 'vue';
import {IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonPage, IonSearchbar} from "@ionic/vue";
import {addOutline, arrowBack, chevronForwardCircle, saveOutline} from 'ionicons/icons';
import {useRecipeStore} from '@/storage';
import ItemEditor from "@/components/editor/ItemEditor.vue";
import {Item, Recipe} from "@/tastebuddy";
import List from "@/components/recipe/List.vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonFabList, IonFabButton, IonIcon, IonFab,
        FancyHeader,
        IonSearchbar,
        List,
        IonPage, IonContent, IonButton,
        ItemEditor
    },
    setup() {
        const recipeStore = useRecipeStore();
        const items: ComputedRef<Item[]> = computed(() => recipeStore.getItemsAsList)

        const filterInput = ref('')

        const addItem = () => Item.newItem().update();
        const removeUnusedItems = () => {
            const items = recipeStore.getItemsAsList;
            const recipesByItemIds = recipeStore.getRecipesByItemIds
            items.forEach((item: Item) => {
                if (!(item.getId() in recipesByItemIds)) {
                    item.delete();
                }
            })
        }
        const saveItems = () => {
            items.value.forEach((item: Item) => {
                item.save();
            })
        }


        return {
            filterInput, items,
            removeUnusedItems, addItem, saveItems,
            // icons
            arrowBack, chevronForwardCircle, addOutline, saveOutline,
            // types
            Item
        }
    }
})
</script>