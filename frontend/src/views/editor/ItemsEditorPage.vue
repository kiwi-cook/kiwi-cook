<template>
    <ion-page id="items-editor-page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Items Editor</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-button @click="removeUnusedItems()">Remove unused items</ion-button>
                        <ion-button @click="addItem()">Add Item</ion-button>
                    </ion-col>
                    <ion-col>
                        <ion-list>
                            <ion-item v-for="item in items" :key="item.getId()">
                                <ItemEditor :item="item" />
                            </ion-item>
                        </ion-list>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, Ref, ref } from 'vue';
import { IonCol, IonContent, IonGrid, IonHeader, IonItem, IonList, IonPage, IonRow, IonTitle, IonToolbar, IonButton } from "@ionic/vue";
import { arrowBack } from 'ionicons/icons';
import { useTasteBuddyStore } from '@/storage';
import ItemEditor from "@/components/editor/ItemEditor.vue";
import { Item } from "@/tastebuddy/types";

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonGrid, IonRow, IonCol, IonButton,
        ItemEditor
    },
    setup() {
        const store = useTasteBuddyStore();
        const items: ComputedRef<Item[]> = computed(() => store.getters.getItems)

        const addItem = () => Item.newItem().update(store);
        const removeUnusedItems = () => {
            const items = store.getters.getItems;
            const recipesByItemIds = store.getters.getRecipesByItemIds
            items.forEach((item: Item) => {
                if (!(item.getId() in recipesByItemIds)) {
                    item.delete(store);
                }
            })
        }

        return {
            items, arrowBack,
            removeUnusedItems, addItem
        }
    }
})
</script>