<template>
    <IonPage id="items-editor-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <FancyHeader :big-text="['Items', 'Editor']" :small-text="`${items.length} Items`"/>

                <IonSearchbar v-model="filterInput" :debounce="500" placeholder="Search Items"/>
                <IonButton fill="outline" color="danger" @click="removeUnusedItems()">Remove unused Items</IonButton>
                <IonButton fill="outline" @click="formatItems()">Format Items</IonButton>
                <IonButton fill="outline" @click="addItem()">Add Item</IonButton>

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

<script setup lang="ts">
import {computed, ComputedRef, ref} from 'vue';
import {IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonPage, IonSearchbar} from "@ionic/vue";
import {addOutline, chevronForwardCircle, saveOutline} from 'ionicons/icons';
import {useRecipeStore} from '@/storage';
import ItemEditor from "@/components/editor/ItemEditor.vue";
import {Item} from "@/tastebuddy";
import List from "@/components/recipe/List.vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";

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
const saveItems = () => recipeStore.saveItems()

const formatItems = () => {
    items.value.forEach((item: Item) => {
        // Fix name
        let name = item.getName()
        name = name[0].toUpperCase() + name.slice(1)
        item.setName(name)
    })
}
</script>