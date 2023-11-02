<template>
    <IonCard>
        <IonCardHeader>
            <IonItem lines="none">
                <IonAvatar v-if="item?.imgUrl">
                    <img :alt="`Image of ${item?.getName()}`" :src="item?.imgUrl"/>
                </IonAvatar>
                <IonChip>
                    {{ item?.getId() }}
                </IonChip>
                <IonButton color="success" fill="outline" @click="saveItem()">
                    <IonIcon :icon="save"/>
                </IonButton>
                <IonButton color="danger" fill="outline"
                           @click="deleteItem()">
                    <IonIcon :icon="trash"/>
                </IonButton>
            </IonItem>
            <IonCardTitle color="primary">
                <template v-for="lang in supportedLanguages" :key="lang">
                    <IonItem lines="none">
                        <IonInput :label="`Name in ${lang}`" :maxlength="40" :value="item?.getName(lang)"
                                  label-placement="stacked"
                                  placeholder="e.g. Baking powder" type="text"
                                  @keyup.enter="item?.setName($event.target.value, lang)"
                                  @ion-blur="item?.setName(($event.target.value ?? '').toString(), lang)"/>
                    </IonItem>
                </template>

                <IonItem lines="none">
                    <IonInput v-model="item.imgUrl" label="Image URL" label-placement="stacked" type="url"/>
                </IonItem>

                <IonItem lines="none">
                    <IonSelect v-model="item.type" label="Type" label-placement="stacked" placeholder="Type">
                        <IonSelectOption value="ingredient">Ingredient</IonSelectOption>
                        <IonSelectOption value="tool">Tool</IonSelectOption>
                    </IonSelect>
                </IonItem>
            </IonCardTitle>
        </IonCardHeader>

        <!-- Item merger -->
        <IonCardContent>
            <IonItem lines="none">
                <IonInput v-model="itemMergerInput" label="Merge with" label-placement="stacked"
                          placeholder="Enter item id"
                          type="text" @keyup.enter="mergeItems()"/>
                <IonButton color="success" fill="outline" @click="mergeItems()">
                    <IonIcon :icon="save"/>
                </IonButton>
            </IonItem>

        </IonCardContent>

        <IonCardContent>
            Used in {{ usedInRecipes.length }} recipes
            <IonButton v-if="usedInRecipes.length > 0" size="small"
                       @click="showUsedInRecipes = !showUsedInRecipes">
                <IonIcon :icon="showUsedInRecipes ? chevronUp : chevronDown"/>
            </IonButton>
            <template v-if="usedInRecipes.length > 0 && showUsedInRecipes">
                <IonList>
                    <template v-for="(recipe, index) in usedInRecipes" :key="index">
                        <router-link :to="recipe.getRoute()">
                            <IonChip>
                                {{ recipe?.getName() }}
                            </IonChip>
                        </router-link>
                    </template>
                </IonList>
            </template>
        </IonCardContent>
    </IonCard>
</template>

<script lang="ts" setup>
import {Item, logDebug} from '@/shared/ts';
import {
    IonAvatar,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonSelect,
    IonSelectOption
} from '@ionic/vue';
import {computed, PropType, ref, toRefs} from 'vue';
import {useRecipeStore} from '@/editor/storage';
import {chevronDown, chevronUp, save, trash} from 'ionicons/icons';
import {MutableItem} from '@/editor/types/item.ts';
import {MutableRecipe} from '@/editor/types/recipe.ts';
import {SUPPORT_LOCALES} from '@/shared/locales/i18n.ts';

const props = defineProps({
    item: {
        type: Object as PropType<MutableItem>,
        required: true
    }
})

const {item} = toRefs(props)
const supportedLanguages = SUPPORT_LOCALES

const recipeStore = useRecipeStore()

const showUsedInRecipes = ref<boolean>(false)
const usedInRecipes = computed<MutableRecipe[]>(() => {
    const recipesByItemIds = recipeStore.getRecipesByItemIds
    if (!recipesByItemIds || !item.value || !(item.value.getId() in recipesByItemIds)) {
        return []
    }
    return recipesByItemIds[item.value?.getId() ?? '']
        .map((recipeId: string) => recipeStore.getRecipesAsMap[recipeId])
})

const saveItem = () => item?.value?.save()
const deleteItem = () => item?.value?.delete()

// Item merger
const itemMergerInput = ref<string>('')
const mergeItems = () => {
    if (!itemMergerInput.value) {
        return
    }
    const isValidId = recipeStore.getItemsAsList.some((item: Item) => item.getId() === itemMergerInput.value)
    if (!isValidId) {
        return
    }
    logDebug('ItemEditor.mergeItems', `Merging ${itemMergerInput.value} => ${item.value.getId()}`)
    const recipesByItemIds = recipeStore.getRecipesByItemIds[itemMergerInput.value]
    for (const recipeId of recipesByItemIds) {
        const recipe = recipeStore.getRecipesAsMap[recipeId] as MutableRecipe
        if (recipe) {
            logDebug('ItemEditor.mergeItems', `Merging recipe ${recipeId}`)
            recipe.replaceItem(itemMergerInput.value, item.value)
            recipe.save()
        }
    }
}
</script>