<template>
    <IonPage id="items-editor-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <FancyHeader :big-text="['Items', 'Editor']" />

                <IonSearchbar v-model="filterInput" :debounce="500"/>
                <IonButton @click="removeUnusedItems()">Remove unused items</IonButton>
                <IonButton @click="addItem()">Add Item</IonButton>

                <List :filter="filterInput" :list="items" no-items-message="No items found">
                    <template #element="{element}">
                        <ItemEditor :item="element as Item"/>
                    </template>
                </List>
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
import {Item} from "@/tastebuddy";
import List from "@/components/recipe/List.vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        FancyHeader,
        IonSearchbar,
        List,
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
            filterInput, items,
            removeUnusedItems, addItem,
            // icons
            arrowBack,
            // types
            Item
        }
    }
})
</script>