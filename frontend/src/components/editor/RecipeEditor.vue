<template>
    <IonCard v-if="mutableRecipe">
        <IonCardHeader>
            <IonGrid>
                <IonRow>
                    <IonCol>
                        <IonInput :maxlength="40" :value="mutableRecipe.name" color="primary"
                                  label="Recipe name"
                                  label-placement="stacked" type="text"
                                  @keyup.enter="mutableRecipe.name = $event.target.value"
                                  @ion-blur="mutableRecipe.name = ($event.target.value ?? '').toString()"/>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size="5">
                        <img :alt="`Image of ${mutableRecipe.name}`" :src="mutableRecipe.props.imgUrl"
                             class="recipe-image"/>
                        <IonInput v-model="mutableRecipe.props.imgUrl" label="Image URL"
                                  label-placement="stacked" type="url"/>
                    </IonCol>
                    <IonCol size="7">
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <IonChip v-if="mutableRecipe._id || mutableRecipe._tmpId">
                                        {{ mutableRecipe._id ?? mutableRecipe._tmpId }}
                                    </IonChip>
                                    <IonChip v-if="mutableRecipe.props.createdAt">
                                        <IonIcon :icon="calendar"/>
                                        <IonLabel>{{ formatDate(mutableRecipe.props.createdAt) }}</IonLabel>
                                    </IonChip>
                                    <IonChip>
                                        <IonIcon :icon="time"/>
                                        <IonLabel>{{ recipe?.getDuration() }} min.</IonLabel>
                                    </IonChip>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonTextarea v-model="mutableRecipe.description"
                                                 :cols="6" :counter="true"
                                                 :rows="3"
                                                 :spellcheck="true" label="Description" label-placement="stacked"
                                                 placeholder="e.g. The best recipe in Germany" wrap="soft"/>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol size="auto">
                                    <IonLabel position="stacked">Authors</IonLabel>
                                    <IonChip v-for="(author, authorIndex) in (mutableRecipe.source.authors ?? [])"
                                             :key="authorIndex"
                                             class="recipe-author">
                                        <IonLabel>{{ author.name }}</IonLabel>
                                        <IonIcon :icon="closeCircleOutline"
                                                 @click="(mutableRecipe.source.authors ?? []).splice(authorIndex, 1)"/>
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
                                    <IonInput v-model="mutableRecipe.source.url" label="Source URL"
                                              label-placement="stacked" type="url"/>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <ItemList :items="mutableRecipe.getStepItems()" :horizontal="true"/>
                            </IonRow>
                        </IonGrid>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size="12">
                        <IonItem class="tags-editor" lines="none">
                            <IonChip v-for="(tag, tagIndex) in (mutableRecipe.props.tags ?? [])" :key="tagIndex"
                                     class="tag">
                                <IonLabel>{{ tag }}</IonLabel>
                                <IonIcon :icon="closeCircleOutline"
                                         @click="(mutableRecipe.props?.tags ?? []).splice(tagIndex, 1)"/>
                            </IonChip>
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
                        </IonItem>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonCardHeader>
    </IonCard>

    <!-- Steps -->
    <IonButton @click="addStep(-1)">Add step</IonButton>
    <template v-for="(step, stepIndex) in mutableRecipe.steps" :key="stepIndex">
        <IonCard class="step-editor shadow">
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
                <IonTextarea v-model.trim="step.description" :cols="6"
                             :counter="true" :rows="3" :spellcheck="true" label="Description"
                             label-placement="stacked" placeholder="e.g. Mix the ingredients together"
                             wrap="soft"/>

                <IonInput v-model.number="step.duration" label="Preparation time (minutes)" label-placement="stacked"
                          max="9999"
                          min="1" type="number"/>

                <IonInput v-model.trim="step.imgUrl" :placeholder="`e.g. https://source.unsplash.com/`"
                          label="Image URL"
                          label-placement="stacked" type="url"/>

                <!-- Item icons -->
                <ItemList :items="step.getItems()" :horizontal="true"/>


                <!-- Items -->
                <div class="items-editor">
                    <template v-for="(stepItem, itemIndex) in step.items"
                              :key="stepIndex + ' - ' + itemIndex + ' - ' + stepItem.name ?? ''">
                        <div class="item-editor shadow">
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
                                <DropDownSearch :custom-mapper="(item: Item) => item.getName()"
                                                :item="stepItem"
                                                :items="items"
                                                label="Name" placeholder="e.g. Baking powder"
                                                class="item-name"
                                                @select-item="selectItem(stepIndex, itemIndex, $event)"
                                                @add-item="addItem(stepIndex, itemIndex, $event)">
                                    <template #item="{ filteredItem }">
                                        <ItemComponent :item="filteredItem"/>
                                        {{ (filteredItem as Item).getId() }}
                                    </template>
                                </DropDownSearch>
                            </IonItem>
                            <IonItem lines="none">
                                <IonGrid>
                                    <IonRow>
                                        <IonCol size="auto">
                                            <IonInput v-model.number="stepItem.amount" inputmode="numeric"
                                                      label="Amount" label-placement="floating" max="9999" min="0"
                                                      type="number"/>
                                        </IonCol>
                                        <IonCol size="8">
                                            <IonSelect v-model="stepItem.unit" label="Unit"
                                                       label-placement="floating"
                                                       placeholder="Unit">
                                                <IonSelectOption value="ml">ml</IonSelectOption>
                                                <IonSelectOption value="l">l</IonSelectOption>
                                                <IonSelectOption value="g">g</IonSelectOption>
                                                <IonSelectOption value="kg">kg</IonSelectOption>
                                                <IonSelectOption value="pcs">pcs</IonSelectOption>
                                            </IonSelect>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                            </IonItem>
                        </div>
                    </template>

                    <template v-for="(missingItem, missingItemIndex) in missingItems[stepIndex]"
                              :key="missingItemIndex">
                        <ItemComponent :item="missingItem" @select="addMissingItem(stepIndex, $event)"/>
                    </template>
                </div>
            </IonCardContent>
            <IonButton @click="addItem(stepIndex)">Add item</IonButton>
        </IonCard>
        <IonButton @click="addStep(stepIndex)">Add step</IonButton>
    </template>
    <IonItem lines="none">
        <IonButton color="success" fill="solid"
                   @click="saveRecipe()">
            <IonIcon :icon="save"/>
        </IonButton>
        <IonButton color="danger" fill="solid"
                   @click="deleteRecipe()">
            <IonIcon :icon="trash"/>
        </IonButton>
    </IonItem>
</template>

<script lang="ts">
import {formatDate, getItemsFromDescription, Item, Recipe, Step, StepItem} from '@/tastebuddy';
import {useRecipeStore} from '@/storage';
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
    IonSelect,
    IonSelectOption,
    IonTextarea,
    useIonRouter
} from '@ionic/vue';
import {computed, ComputedRef, defineComponent, PropType, ref, toRefs, watch} from 'vue';
import {calendar, closeCircleOutline, create, save, time, trash} from 'ionicons/icons';
import DropDownSearch from '../utility/DropDownSearch.vue';
import ItemList from "@/components/recipe/ItemList.vue";
import ItemComponent from "@/components/recipe/Item.vue";

export default defineComponent({
    name: 'RecipeEditor',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
        ItemList,
        IonGrid,
        IonRow,
        IonCol,
        IonIcon,
        IonAvatar,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonButton,
        IonInput,
        IonTextarea,
        IonItem,
        IonLabel,
        IonSelect,
        IonSelectOption,
        IonChip,
        DropDownSearch,
        ItemComponent
    },
    setup(props) {
        const {recipe} = toRefs(props)

        const router = useIonRouter();
        const recipeStore = useRecipeStore();

        const items = computed<Item[]>(() => recipeStore.getItems);

        const mutableRecipe = ref<Recipe>(recipe.value)
        // update recipe and steps when prop changes
        watch(recipe, (newRecipe: Recipe) => {
            mutableRecipe.value = newRecipe
        }, {immediate: true})

        /**
         * Save recipe to the Backend API
         */
        const saveRecipe = () => mutableRecipe.value?.save()

        /**
         * Delete recipe from the Backend API
         * Redirect to SavedRecipes
         */
        const deleteRecipe = () => mutableRecipe.value?.delete().then(() => {
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
        const addItem = (stepIndex?: number, itemIndex?: number, itemName?: string) => mutableRecipe
            .value?.addItem(stepIndex, itemIndex, Item.newItemFromName(itemName)).item.update()

        /**
         * Select an item in a step and update it
         * @param stepIndex index of the step to select the item in
         * @param itemIndex index of the item to select
         * @param item item to update
         */
        const selectItem = (stepIndex: number, itemIndex: number, item: Item) => mutableRecipe
            .value?.steps[stepIndex].items[itemIndex].updateItem(item)


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
            params: {id: mutableRecipe.value?.steps[stepIndex].items[itemIndex]}
        })

        /**
         * Get a map of missing items for each step
         */
        const missingItems = computed<{ [stepIndex: number]: Item[] }>(() => {
            const missingItems: { [stepIndex: number]: Item[] } = {}
            const steps = recipe.value.steps
            steps.forEach((step: Step, stepIndex: number) => {
                const stepItems = step.getItems()
                // return only items that aren't in the step
                missingItems[stepIndex] = getItemsFromDescription(step.description)
                    .filter((item: Item) => !stepItems.some((stepItem: StepItem) => item.name == stepItem.name))
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
            console.log(item)
            mutableRecipe.value?.addItem(stepIndex, undefined, item)
        }

        /**
         * Get all tags from the store
         */
        const allTags: ComputedRef<string[]> = computed(() => recipeStore.getTags);

        return {
            // recipe
            mutableRecipe, saveRecipe, deleteRecipe,
            // steps
            addStep, removeStep,
            // items
            items, addItem, editItem, selectItem, removeItem,
            missingItems, addMissingItem,
            // tags
            allTags,
            // icons
            closeCircleOutline, trash, create, save, time, calendar,
            // utility
            formatDate,
            // types
            Item
        };
    },
})
</script>

<style scoped>
.recipe-image {
    border-radius: 15px;
    width: 100%;
}

ion-textarea {
    width: 100%;
    height: 100px;
}

ion-card {
    /* nice shadow with light background and round corners */
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2), 0 0 10px 0 rgba(0, 0, 0, 0.19);
}

ion-item {
    display: block;
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
    margin: 10px;
    max-width: fit-content;
    border-radius: var(--border-radius);
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