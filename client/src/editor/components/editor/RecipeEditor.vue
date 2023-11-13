<template>
    <IonCard>
        <div class="recipe-image-wrapper">
            <IonImg :src="recipe?.props?.imgUrl" alt="Header Image" class="recipe-image"/>
        </div>
        <IonCardHeader>

            <IonGrid class="w100">
                <IonRow>
                    <IonCol size="12" size-md="6">
                        <IonRow>
                            <IonInput :maxlength="100" :value="mutableRecipe.getName()" color="primary"
                                      label="Recipe name"
                                      label-placement="stacked" type="text"
                                      @focusout.capture="mutableRecipe.setName($event.target.value ?? '')"/>
                            <IonInput v-model="mutableRecipe.props.imgUrl" label="Image URL"
                                      label-placement="stacked" type="url"/>
                        </IonRow>
                        <IonRow>
                            <IonChip v-if="mutableRecipe.props.date">
                                <IonIcon :icon="calendar"/>
                                <IonLabel>{{ formatDate(mutableRecipe.props.date) }}</IonLabel>
                            </IonChip>
                            <Duration :duration="mutableRecipe.getDuration()" always-show/>
                        </IonRow>
                    </IonCol>
                    <IonCol size="12" size-md="6">
                        <!-- Add tag to the list -->
                        <DropDownSearch :items="allTags" :reset-after="true" label="Tag" placeholder="e.g. vegan"
                                        @select-item="mutableRecipe.addTag($event)">
                            <template #item="{ filteredItem }">
                                <IonChip class="tag">
                                    <IonLabel>{{ filteredItem }}</IonLabel>
                                </IonChip>
                            </template>
                        </DropDownSearch>

                        <IonChip v-for="(tag, tagIndex) in mutableRecipe.getTags()" :key="tagIndex">
                            <IonLabel>{{ tag }}</IonLabel>
                            <IonIcon :icon="closeCircleOutline"
                                     @click="(mutableRecipe.props?.tags ?? []).splice(tagIndex, 1)"/>
                        </IonChip>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonCardHeader>

        <IonCardContent>
            <IonTextarea :counter="true"
                         :rows="4"
                         :spellcheck="true" :value="mutableRecipe.getDescription()"
                         label="Description"
                         label-placement="stacked"
                         placeholder="e.g. The best recipe in Germany" wrap="soft"
                         @keyup.enter="mutableRecipe.setDescription($event.target.value ?? '')"
                         @ion-blur="mutableRecipe.setDescription($event.target.value ?? '')"/>
            <IonInput label="Add author" label-placement="stacked"
                      placeholder="e.g. John Doe"
                      type="text"
                      @keydown.enter="mutableRecipe.addAuthor($event.target.value)"/>
            <IonChip v-for="(author, authorIndex) in (mutableRecipe.src.authors ?? [])"
                     :key="authorIndex"
                     class="recipe-author">
                <IonLabel>{{ author.name }}</IonLabel>
                <IonIcon :icon="closeCircleOutline"
                         @click="(mutableRecipe.src.authors ?? []).splice(authorIndex, 1)"/>
            </IonChip>
            <IonInput v-model="mutableRecipe.src.url" label="Source URL"
                      label-placement="stacked" type="url"/>
            <ItemList :horizontal="true" :items="mutableRecipe.getStepItems()"/>
        </IonCardContent>
    </IonCard>

    <!-- Steps -->
    <IonButton @click="addStep(-1)">
        Add Step
    </IonButton>
    <template v-for="(step, stepIndex) in mutableRecipe.steps" :key="stepIndex">
        <IonCard class="step-editor">
            <IonButton color="danger" fill="solid" @click="removeStep(stepIndex)">
                Remove Step
            </IonButton>
            <IonCardHeader>
                <IonCardTitle>
                    Step {{ stepIndex + 1 }}
                </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
                <IonTextarea :counter="true"
                             :spellcheck="true" :value="step.getDescription()"
                             label="Description"
                             label-placement="stacked"
                             placeholder="e.g. Mix the ingredients together" wrap="soft"
                             @keyup.enter="step.setDescription($event.target.value ?? '')"
                             @ion-blur="step.setDescription($event.target.value ?? '')"/>

                <IonGrid>
                    <IonRow>
                        <IonCol size="3">
                            <IonInput v-model.number="step.duration" inputmode="numeric"
                                      label="Preparation time (minutes)"
                                      label-placement="stacked"
                                      max="2400" min="1" type="number"/>

                        </IonCol>
                        <IonCol size="3">
                            <IonInput v-model.number="step.temperature" inputmode="numeric" label="Temperature (°C)"
                                      label-placement="stacked"
                                      max="1000" min="-50" type="number"/>

                        </IonCol>
                        <IonCol size="6">
                            <IonInput v-model.trim="step.imgUrl" :placeholder="`e.g. https://source.unsplash.com/`"
                                      label="Image URL"
                                      label-placement="stacked" type="url"/>
                        </IonCol>
                    </IonRow>
                </IonGrid>


                <!-- Items -->
                <div class="items-editor">
                    <div v-for="(stepItem, itemIndex) in step.items"
                         :key="`${stepIndex} - ${itemIndex} - ${stepItem.getId()}` ?? ''"
                         class="item-editor">

                        <div class="item-edit">
                            <IonInput v-model="stepItem.quantity" class="item-quantity" step=".1" type="number"/>
                            <IonInput v-model="stepItem.unit" class="item-unit"/>
                            <IonInput :value="stepItem.name['en']" class="item-name"
                                      label="Name"
                                      label-placement="floating" type="text"
                                      @focusout="updateName($event.target.value, stepIndex, itemIndex)"/>
                            <IonButton color="danger" @click="removeItem(stepIndex, itemIndex)">Remove</IonButton>
                        </div>
                    </div>

                    <template v-for="(missingItem, missingItemIndex) in missingItems[stepIndex]"
                              :key="missingItemIndex">
                        <ItemComponent :item="missingItem" class="link"
                                       @click="addMissingItem(stepIndex, missingItem.getId())"/>
                    </template>
                </div>
            </IonCardContent>
            <IonButton @click="addItem(stepIndex)">
                Add Item
            </IonButton>
        </IonCard>
        <IonButton @click="addStep(stepIndex)">
            Add Step
        </IonButton>
    </template>
    <IonButton fill="solid"
               @click="saveRecipe()">
        Save Recipe
    </IonButton>
    <IonButton color="danger" fill="solid"
               @click="deleteRecipe()">
        Remove Recipe
    </IonButton>
</template>

<script lang="ts" setup>
import {formatDate, Item, Step, StepItem} from '@/shared/ts';
import {useRecipeStore} from '@/editor/storage';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonCol,
    IonGrid,
    IonIcon,
    IonImg,
    IonInput,
    IonLabel,
    IonRow,
    IonTextarea,
    useIonRouter
} from '@ionic/vue';
import {computed, PropType, ref, toRefs, watch} from 'vue';
import {calendar, closeCircleOutline} from 'ionicons/icons';
import ItemComponent from '@/shared/components/recipe/Item.vue';
import {extractStepItemsFromText, findMostSimilarItem} from '@/editor/parser/utils.ts';
import {MutableRecipe} from '@/editor/types/recipe.ts';
import DropDownSearch from '@/shared/components/utility/DropDownSearch.vue';
import ItemList from '@/shared/components/utility/list/ItemList.vue';
import Duration from '@/shared/components/recipe/chip/Duration.vue';
import {newItemFromName} from '@/editor/types/item.ts';

const props = defineProps({
    recipe: {
        type: Object as PropType<MutableRecipe>,
        required: true,
    },
});
const {recipe} = toRefs(props)

const router = useIonRouter();
const recipeStore = useRecipeStore();

const mutableRecipe = ref<MutableRecipe>(recipe.value)
// update recipe and steps when prop changes
watch(recipe, (newRecipe: MutableRecipe) => {
    mutableRecipe.value = newRecipe
}, {immediate: true})

/**
 * Save recipe to the Backend API
 */
const saveRecipe = () => mutableRecipe?.value?.save()

/**
 * Delete recipe from the Backend API
 * Redirect to SavedRecipes
 */
const deleteRecipe = () => mutableRecipe?.value?.delete().then(() => {
    router.push({name: 'SavedRecipes'})
})

/**
 * Add a step to the recipe
 * @param stepIndex index of the step to add after
 */
const addStep = (stepIndex: number) => mutableRecipe.value?.addStep(undefined, stepIndex)


/**
 * Remove a step from the recipe
 * @param stepIndex index of the step to remove
 */
const removeStep = (stepIndex: number) => mutableRecipe.value?.removeStep(stepIndex)

/**
 * Add an item to a step
 * @param stepIndex index of the step to add the item to
 * @param itemIndex index of the item to add after
 * @param itemName name of the item to add
 */
const addItem = (stepIndex?: number, itemIndex?: number, itemName?: string) => mutableRecipe?.value
    ?.addItem(stepIndex, itemIndex, newItemFromName(itemName)).item.update()


/**
 * Remove an item from a step
 * @param stepIndex index of the step to remove the item from
 * @param itemIndex index of the item to remove
 */
const removeItem = (stepIndex: number, itemIndex: number) => mutableRecipe
    .value?.steps[stepIndex].items.splice(itemIndex, 1);

/**
 * Edit the item
 * @param stepIndex index of the step to edit the item from
 * @param itemIndex index of the item to edit
 */
const editItem = (stepIndex: number, itemIndex: number) => router.push({
    name: 'ItemEditor',
    params: {id: mutableRecipe.value?.steps?.[stepIndex].items?.[itemIndex]}
})

/**
 * Update the quantity and unit of an item
 * @param quantityUnit
 * @param stepIndex
 * @param itemIndex
 */
const updateQuantityUnit = (quantityUnit: string, stepIndex: number, itemIndex: number) => {
    const [quantity, unit] = quantityUnit.split(' ')
    mutableRecipe.value?.steps?.[stepIndex]?.items?.[itemIndex]?.setUnit(unit)
    mutableRecipe.value?.steps?.[stepIndex]?.items?.[itemIndex]?.setQuantity(parseFloat(quantity))
}

const updateName = (name: string, stepIndex: number, itemIndex: number) => {
    const item = findMostSimilarItem(name)
    if (typeof item === 'undefined') {
        return
    }
    mutableRecipe.value?.steps?.[stepIndex]?.items?.[itemIndex]?.updateItem(item)
}

/**
 * Get a map of missing items for each step
 */
const missingItems = computed<{ [stepIndex: number]: Item[] }>(() => {
    const missingItems: { [stepIndex: number]: Item[] } = {}
    const steps = recipe.value.steps
    steps.forEach((step: Step, stepIndex: number) => {
        const stepItems = step.getStepItems()
        // return only items that aren't in the step
        missingItems[stepIndex] = extractStepItemsFromText(step.getDescription())
            .filter((item: Item) => !stepItems.some((stepItem: StepItem) => item.getName() == stepItem.getName()))
    })
    return missingItems
})

/**
 * Add missing item to recipe
 * @param stepIndex
 * @param itemId
 */
const addMissingItem = (stepIndex: number, itemId: string) => {
    const item = recipeStore.getItemsAsMap[itemId]
    mutableRecipe.value?.addItem(stepIndex, undefined, item)
}

/**
 * Get all tags from the store
 */
const allTags = computed<string[]>(() => recipeStore.getTags);
</script>

<style scoped>
.recipe-image-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
}

.recipe-image::part(image) {
    max-width: 400px;
    height: auto;
    border-radius: var(--border-radius);
}

ion-textarea {
    width: 100%;
    height: 100px;
}

ion-card {
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
}

ion-avatar.recipe-preview-img {
    --size: 140px;
}

.tags-editor {
    margin: 10px;
    max-width: fit-content;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.step-editor {
    width: 100%;
    margin-bottom: 10px;
    padding-bottom: 5px;
}

.items-editor {
    margin: 10px;
    max-width: fit-content;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.item-editor {
    margin: var(--margin);
    padding: var(--padding);
    border-radius: var(--border-radius);
    border: var(--border);
}

@media screen and (max-width: 600px) {
    .tags-editor {
        flex-direction: column;
    }

    .items-editor {
        flex-direction: column;
    }
}

ion-button {
    margin-left: 10px;
    margin-right: 10px;
}

.item-edit {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.item-quantity, .item-unit, .item-name {
    width: 30%;
}
</style>