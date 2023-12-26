<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonPage id="items-editor-page">
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="['Items', 'Editor']" :small-text="`${items.length} Items`"/>

                    <IonSearchbar v-model="filterInput" :debounce="500" placeholder="Search Items"/>
                    <IonButtons>
                        <IonButton @click="saveItems()">
                            <IonIcon :icon="save"/>
                            Save
                        </IonButton>
                        <IonButton @click="addItem()">
                            <IonIcon :icon="addOutline"/>
                            Add
                        </IonButton>
                        <IonButton @click="formatItems()">
                            <IonIcon :icon="colorWand"/>
                            Format
                        </IonButton>
                        <IonButton color="danger" @click="removeDuplicates()">
                            <IonIcon :icon="documents"/>
                            Remove duplicates
                        </IonButton>
                        <IonButton color="danger" @click="removeUnusedItems()">
                            <IonIcon :icon="trash"/>
                            Remove unused
                        </IonButton>
                    </IonButtons>

                    <IonAccordionGroup :multiple="true">
                        <IonAccordion v-for="(item, index) in items" :key="index" :value="item.getId()">
                            <IonItem slot="header">
                                <IonLabel>
                                    {{ item.getName(undefined, 1) }}
                                </IonLabel>
                            </IonItem>
                            <div slot="content" class="ion-padding">
                                <ItemEditor :item="item"/>
                            </div>
                        </IonAccordion>
                    </IonAccordionGroup>

                </div>

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

<script lang="ts" setup>
import {computed, ref} from 'vue';
import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonFabList,
    IonIcon,
    IonItem,
    IonLabel,
    IonPage,
    IonSearchbar
} from '@ionic/vue';
import {addOutline, chevronForwardCircle, colorWand, documents, save, saveOutline, trash} from 'ionicons/icons';
import {useRecipeEditorStore} from '@/editor/storage';
import ItemEditor from '@/editor/components/editor/ItemEditor.vue';
import {Item} from '@/shared';
import Header from '@/shared/components/utility/header/Header.vue';
import {MutableItem} from '@/editor/types/item';

const recipeStore = useRecipeEditorStore();
const items = computed<MutableItem[]>(() => {
    return recipeStore.getItemsAsList
        .filter(item => item.getName().toLowerCase().includes(filterInput.value.toLowerCase()))
        .toSorted((a, b) => a.getName().localeCompare(b.getName()))
})
const recipesByItemIds = computed(() => recipeStore.getRecipesByItemIds)

const filterInput = ref('')

const saveItems = () => recipeStore.saveItems()

const addItem = () => new MutableItem().update();

const formatItems = () => {
    items.value.forEach((item: Item) => {
        // Fix name
        let name = item.getName()
        // Capitalize first letter
        name = name[0].toUpperCase() + name.slice(1)
        // Replace dashes with spaces
        name = name.replace(/-/g, ' ')

        item.setName(name, 'en')

        // Add img url
        if (!item.imgUrl || item.imgUrl === '') {
            item.imgUrl = `https://spoonacular.com/cdn/ingredients_100x100/${name.toLowerCase()}.jpg`
        }
    })
}

const removeDuplicates = () => {
    const itemNames: string[] = []
    items.value.forEach((item: MutableItem) => {
        const name = item.getName()
        if (itemNames.includes(name)) {
            item.delete()
        } else {
            itemNames.push(name)
        }
    })
}

const removeUnusedItems = () => {
    items.value.forEach((item: MutableItem) => {
        if (!(item.getId() in recipesByItemIds.value)) {
            item.delete();
        }
    })
}


</script>