<template>
    <IonPage id="items-editor-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <h1 class="header-title">
                    Items Editor
                </h1>

                <IonSearchbar v-model="filterInput" :debounce="500"/>

                <TwoColumnLayout>
                    <template #left>
                        <IonButton @click="removeUnusedItems()">Remove unused items</IonButton>
                        <IonButton @click="addItem()">Add Item</IonButton>
                    </template>
                    <template #right>
                        <List :item-list="items" :filter="filterInput" no-items-message="No items found">
                            <template #item="{item}">
                                <ItemEditor :item="item"/>
                            </template>
                        </List>
                    </template>
                </TwoColumnLayout>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, ref} from 'vue';
import {IonButton, IonContent, IonPage, IonSearchbar} from "@ionic/vue";
import {arrowBack} from 'ionicons/icons';
import {useRecipeStore} from '@/storage';
import ItemEditor from "@/components/editor/ItemEditor.vue";
import {Item} from "@/tastebuddy/types";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";
import List from "@/components/utility/List.vue";

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonSearchbar,
        List,
        TwoColumnLayout,
        IonPage, IonContent, IonButton,
        ItemEditor
    },
    setup() {
        const store = useRecipeStore();
        const items: ComputedRef<Item[]> = computed(() => store.getItems)

        const filterInput = ref('')

        const addItem = () => Item.newItem().update();
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
            filterInput,
            items, arrowBack,
            removeUnusedItems, addItem
        }
    }
})
</script>