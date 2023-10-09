<template>
    <IonCard v-if="mutableRecipe">
        <IonCardHeader>
            <IonGrid>
                <IonRow>
                    <IonCol>
                        <IonInput :maxlength="40" :value="mutableRecipe.getName()" color="primary"
                                  label="Recipe name"
                                  label-placement="stacked" type="text"
                                  @focusout.capture="mutableRecipe.setName($event.target.value ?? '')"/>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size="5">
                        <img :alt="`Image of ${mutableRecipe.getName()}`" :src="mutableRecipe.props.imgUrl"
                             class="recipe-image"/>
                        <IonInput v-model="mutableRecipe.props.imgUrl" label="Image URL"
                                  label-placement="stacked" type="url"/>
                    </IonCol>
                    <IonCol size="7">
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <IonChip>
                                        {{ mutableRecipe.getId() }}
                                    </IonChip>
                                    <IonChip v-if="mutableRecipe.props.date">
                                        <IonIcon :icon="calendar"/>
                                        <IonLabel>{{ formatDate(mutableRecipe.props.date) }}</IonLabel>
                                    </IonChip>
                                    <IonChip>
                                        <IonIcon :icon="time"/>
                                        <IonLabel>{{ recipe?.getDuration() }} min.</IonLabel>
                                    </IonChip>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonTextarea :value="mutableRecipe.getDescription()"
                                                 :counter="true"
                                                 :rows="3" :spellcheck="true"
                                                 label="Description"
                                                 wrap="soft"
                                                 label-placement="stacked" placeholder="e.g. The best recipe in Germany"
                                                 @keyup.enter="mutableRecipe.setDescription($event.target.value ?? '')"
                                                 @ion-blur="mutableRecipe.setDescription($event.target.value ?? '')"/>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol size="auto">
                                    <IonLabel position="stacked">Authors</IonLabel>
                                    <IonChip v-for="(author, authorIndex) in (mutableRecipe.src.authors ?? [])"
                                             :key="authorIndex"
                                             class="recipe-author">
                                        <IonLabel>{{ author.name }}</IonLabel>
                                        <IonIcon :icon="closeCircleOutline"
                                                 @click="(mutableRecipe.src.authors ?? []).splice(authorIndex, 1)"/>
                                    </IonChip>
                                    <IonInput label="Add author" label-placement="stacked"
                                              placeholder="e.g. John Doe"
                                              type="text"
                                              @keydown.enter="mutableRecipe.addAuthor($event.target.value)"/>
                                </IonCol>
                                <IonCol size="auto">

                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonInput v-model="mutableRecipe.src.url" label="Source URL"
                                              label-placement="stacked" type="url"/>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <ItemList :horizontal="true" :items="mutableRecipe.getStepItems()"/>
                            </IonRow>
                        </IonGrid>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size="12">
                        <IonItem class="tags-editor" lines="none">
                            <!-- Add tag to the list -->
                            <DropDownSearch :items="allTags" :reset-after="true" placeholder="e.g. vegan"
                                            @select-item="mutableRecipe.addTag($event)"
                                            @add-item="mutableRecipe.addTag($event)">
                                <template #item="{ filteredItem }">
                                    <IonChip class="tag">
                                        <IonLabel>{{ filteredItem }}</IonLabel>
                                    </IonChip>
                                </template>
                            </DropDownSearch>

                            <IonChip v-for="(tag, tagIndex) in mutableRecipe.getTags()" :key="tagIndex"
                                     class="tag">
                                <IonLabel>{{ tag }}</IonLabel>
                                <IonIcon :icon="closeCircleOutline"
                                         @click="(mutableRecipe.props?.tags ?? []).splice(tagIndex, 1)"/>
                            </IonChip>
                        </IonItem>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonCardHeader>
    </IonCard>

    <!-- Steps -->
    <IonButton @click="addStep(-1)">
        <IonIcon :icon="addOutline"/>
    </IonButton>
    <template v-for="(step, stepIndex) in mutableRecipe.steps" :key="stepIndex">
        <IonCard class="step-editor">
            <IonCardHeader>
                <IonItem lines="none">
                    <IonCardTitle>
                        <span class="recipe-step-index">Step {{ stepIndex + 1 }}</span><span
                            class="recipe-step-index-max"> / {{ mutableRecipe.steps.length }}</span>
                    </IonCardTitle>
                    <IonButton color="danger" fill="solid" @click="removeStep(stepIndex)">
                        <IonIcon :icon="trash"/>
                    </IonButton>
                </IonItem>
            </IonCardHeader>

            <IonCardContent>
                <IonTextarea :value="step.getDescription()"
                             :counter="true"
                             :rows="3" :spellcheck="true"
                             label="Description"
                             wrap="soft"
                             label-placement="stacked" placeholder="e.g. Mix the ingredients together"
                             @keyup.enter="step.setDescription($event.target.value ?? '')"
                             @ion-blur="step.setDescription($event.target.value ?? '')"/>

                <IonInput v-model.number="step.duration" label="Preparation time (minutes)" label-placement="stacked"
                          max="2400"
                          min="1" type="number" inputmode="numeric"/>

                <IonInput v-model.number="step.temperature" label="Temperature (°C)" label-placement="stacked"
                          max="1000"
                          min="-50" type="number" inputmode="numeric"/>

                <IonInput v-model.trim="step.imgUrl" :placeholder="`e.g. https://source.unsplash.com/`"
                          label="Image URL"
                          label-placement="stacked" type="url"/>

                <!-- Item icons -->
                <ItemList :horizontal="true" :items="step.getStepItems()"/>


                <!-- Items -->
                <div class="items-editor">
                    <div v-for="(stepItem, itemIndex) in step.items"
                         :key="`${stepIndex} - ${itemIndex} - ${stepItem.getId()}` ?? ''"
                         class="item-editor">
                        <IonItem lines="none">
                            <IonItem lines="none">
                                <IonAvatar v-if="stepItem.imgUrl">
                                    <img :alt="`Image of ${stepItem.getName()}`" :src="stepItem.imgUrl"/>
                                </IonAvatar>
                                <IonChip>
                                    {{ stepItem.getId() }}
                                </IonChip>
                                <IonButton color="success" fill="solid"
                                           @click="editItem(stepIndex, itemIndex)">
                                    <IonIcon :icon="create"/>
                                </IonButton>
                                <IonButton color="danger" fill="solid"
                                           @click="removeItem(stepIndex, itemIndex)">
                                    <IonIcon :icon="trash"/>
                                </IonButton>
                            </IonItem>
                        </IonItem>
                        <IonItem lines="none">
                            <IonInput :value="`${stepItem.quantity} ${stepItem.unit}`"
                                      label="Amount and unit"
                                      label-placement="floating" type="text"
                                      @focusout="updateQuantityUnit($event.target.value, stepIndex, itemIndex)"/>
                        </IonItem>

                        <IonItem lines="none">
                            <IonInput :value="stepItem.getName()"
                                      label="Name"
                                      label-placement="floating" type="text"
                                      @focusout="updateName($event.target.value, stepIndex, itemIndex)"/>
                        </IonItem>
                    </div>

                    <template v-for="(missingItem, missingItemIndex) in missingItems[stepIndex]"
                              :key="missingItemIndex">
                        <ItemComponent :item="missingItem" @click="addMissingItem(stepIndex, $event)"/>
                    </template>
                </div>
            </IonCardContent>
            <IonButton @click="addItem(stepIndex)">
                <IonIcon :icon="addOutline"/>
            </IonButton>
        </IonCard>
        <IonButton @click="addStep(stepIndex)">
            <IonIcon :icon="addOutline"/>
        </IonButton>
    </template>
    <IonItem lines="none">
        <IonButton fill="solid"
                   @click="saveRecipe()">
            <IonIcon :icon="save"/>
        </IonButton>
        <IonButton color="danger" fill="solid"
                   @click="deleteRecipe()">
            <IonIcon :icon="trash"/>
        </IonButton>
    </IonItem>
</template>

<script setup lang="ts">
import {formatDate, Item, MutableItem, MutableRecipe, newItemFromName, Recipe, Step, StepItem} from '@/shared';
import {useRecipeStore} from '@/app/storage';
import {
    IonAvatar,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonRow,
    IonTextarea,
    useIonRouter
} from '@ionic/vue';
import {computed, PropType, ref, toRefs, watch} from 'vue';
import {addOutline, calendar, closeCircleOutline, create, save, time, trash} from 'ionicons/icons';
import DropDownSearch from '../../../app/components/utility/DropDownSearch.vue';
import ItemList from "@/app/components/utility/list/ItemList.vue";
import ItemComponent from "@/app/components/recipe/Item.vue";
import {extractStepItemsFromText, findMostSimilarItem} from "@/editor/parser/utils.ts";

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
const addItem = (stepIndex?: number, itemIndex?: number, itemName?: string) => mutableRecipe?.value?.addItem(stepIndex, itemIndex, newItemFromName(itemName)).item.update()


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
.recipe-image {
    border-radius: var(--border-radius);
    width: 100%;
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
</style>