<template>
    <IonPage id="items-editor-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <FancyHeader :big-text="['Items', 'Editor']" :small-text="`${items.length} Items`"/>

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
                                {{ item.getName() }}
                            </IonLabel>
                        </IonItem>
                        <div slot="content" class="ion-padding">
                            <ItemEditor :item="item"/>
                        </div>
                    </IonAccordion>
                </IonAccordionGroup>

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
} from "@ionic/vue";
import {addOutline, chevronForwardCircle, colorWand, documents, save, saveOutline, trash} from 'ionicons/icons';
import {useRecipeStore} from '@/app/storage';
import ItemEditor from "@/shared/components/editor/ItemEditor.vue";
import {Item, MutableItem} from "@/shared";
import FancyHeader from "@/app/components/utility/fancy/FancyHeader.vue";

const recipeStore = useRecipeStore();
const items = computed<MutableItem[]>(() => {
    const items = (recipeStore.getItemsAsList as MutableItem[])
        .filter(item => item.getName().toLowerCase().includes(filterInput.value.toLowerCase()))
    items.sort((a, b) => a.getName().localeCompare(b.getName()))
    return items
})
const recipesByItemIds = computed(() => recipeStore.getRecipesByItemIds)

const filterInput = ref('')

const saveItems = () => recipeStore.saveItems()

const addItem = () => new MutableItem().update();

const formatItems = () => {
    items.value.forEach((item: Item) => {
        // Fix name
        let name = item.getName()
        name = name[0].toUpperCase() + name.slice(1)
        name = name.replace(/-/g, ' ')
        item.setName(name)

        // Add img url
        if (!item.imgUrl || item.imgUrl === '') {
            item.imgUrl = `https://spoonacular.com/cdn/ingredients_100x100/${name.toLowerCase()}.jpg`
        }
    })
}

const removeDuplicates = () => {
    const itemNames: string[] = []
    items.value.forEach((item: Item) => {
        const name = item.getName()
        if (itemNames.includes(name)) {
            item.delete()
        } else {
            itemNames.push(name)
        }
    })
}

const removeUnusedItems = () => {
    items.value.forEach((item: Item) => {
        if (!(item.getId() in recipesByItemIds.value)) {
            item.delete();
        }
    })
}


</script>