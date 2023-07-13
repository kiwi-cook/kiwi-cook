<template>
    <IonPage id="items-editor-page">
        <IonHeader>
            <IonToolbar>
                <IonTitle>Items Editor</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent :fullscreen="true">
            <div class="content">
                <TwoColumnLayout>
                    <template #left>
                        <IonButton @click="removeUnusedItems()">Remove unused items</IonButton>
                        <IonButton @click="addItem()">Add Item</IonButton>
                    </template>
                    <template #right>
                        <IonList>
                            <IonItem v-for="item in items" :key="item.getId()">
                                <ItemEditor :item="item"/>
                            </IonItem>
                        </IonList>
                    </template>
                </TwoColumnLayout>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent} from 'vue';
import {IonButton, IonContent, IonHeader, IonItem, IonList, IonPage, IonTitle, IonToolbar} from "@ionic/vue";
import {arrowBack} from 'ionicons/icons';
import {useTasteBuddyStore} from '@/storage';
import ItemEditor from "@/components/editor/ItemEditor.vue";
import {Item} from "@/tastebuddy/types";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        TwoColumnLayout,
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonButton,
        ItemEditor
    },
    setup() {
        const store = useTasteBuddyStore();
        const items: ComputedRef<Item[]> = computed(() => store.getItems)

        const addItem = () => Item.newItem().update(store);
        const removeUnusedItems = () => {
            const items = store.getItems;
            const recipesByItemIds = store.getRecipesByItemIds
            items.forEach((item: Item) => {
                if (!(item.getId() in recipesByItemIds)) {
                    item.delete();
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