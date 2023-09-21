<template>
    <IonCard>
        <IonCardHeader>
            <IonItem lines="none">
                <IonAvatar v-if="mutableItem.imgUrl">
                    <img :alt="`Image of ${mutableItem.getName()}`" :src="mutableItem.imgUrl"/>
                </IonAvatar>
                <IonChip>
                    {{ mutableItem.getId() }}
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
                        <IonInput :label="`Name in ${lang}`" :maxlength="40" :value="item.getName(lang)"
                                  label-placement="stacked"
                                  placeholder="e.g. Baking powder" type="text"
                                  @keyup.enter="item.setName($event.target.value, lang)"
                                  @ion-blur="item.setName(($event.target.value ?? '').toString(), lang)"/>
                    </IonItem>
                </template>

                <IonItem lines="none">
                    <IonInput v-model="mutableItem.imgUrl" label="Image URL" label-placement="stacked" type="url"/>
                </IonItem>

                <IonItem lines="none">
                    <IonSelect v-model="mutableItem.type" label="Type" label-placement="stacked" placeholder="Type">
                        <IonSelectOption value="ingredient">Ingredient</IonSelectOption>
                        <IonSelectOption value="tool">Tool</IonSelectOption>
                    </IonSelect>
                </IonItem>
            </IonCardTitle>
        </IonCardHeader>

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

<script setup lang="ts">
import {Item, Recipe} from '@/tastebuddy/types';
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
import {computed, ComputedRef, PropType, Ref, ref, toRefs, watch} from 'vue';
import {useRecipeStore, useTasteBuddyStore} from '@/storage';
import {chevronDown, chevronUp, save, trash} from "ionicons/icons";

const props = defineProps({
    item: {
        type: Object as PropType<Item>,
        required: true
    }
})

const {item} = toRefs(props)
const tasteBuddyStore = useTasteBuddyStore()
const supportedLanguages = tasteBuddyStore.language.supportedLanguages

const recipeStore = useRecipeStore()

const mutableItem: Ref<Item> = ref(item.value)
// update mutableItem when item changes
watch(item, () => {
    mutableItem.value = item.value
})

const showUsedInRecipes: Ref<boolean> = ref(false)
const usedInRecipes: ComputedRef<Recipe[]> = computed(() => {
    const recipesByItemIds = recipeStore.getRecipesByItemIds
    if (!recipesByItemIds || !item.value || !(item.value.getId() in recipesByItemIds)) {
        return []
    }
    return recipesByItemIds[item.value?.getId() ?? '']
        .map((recipeId: string) => recipeStore.getRecipesAsMap[recipeId])
})

const saveItem = () => mutableItem.value.save()
const deleteItem = () => mutableItem.value.delete()
</script>