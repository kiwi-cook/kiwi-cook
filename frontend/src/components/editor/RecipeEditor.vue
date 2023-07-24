<template>
    <IonCard v-if="mutableRecipe" class="recipe-editor">
        <IonCardHeader>
            <IonGrid>
                <IonRow>
                    <IonCol size="auto">
                        <IonAvatar v-if="mutableRecipe.props.imgUrl" class="recipe-preview-img">
                            <img :alt="`Image of ${mutableRecipe.name}`" :src="mutableRecipe.props.imgUrl"/>
                        </IonAvatar>
                    </IonCol>
                    <IonCol size="3">
                        <IonCardTitle>
                            <IonInput :maxlength="40" :value="mutableRecipe.name" aria-label="Recipe name"
                                      type="text"
                                      @keyup.enter="mutableRecipe.name = $event.target.value"
                                      @ion-blur="mutableRecipe.name = ($event.target.value ?? '').toString()"/>
                        </IonCardTitle>
                    </IonCol>
                    <IonCol size="auto">
                        <IonChip v-if="mutableRecipe._id || mutableRecipe._tmpId">
                            {{ mutableRecipe._id ?? mutableRecipe._tmpId }}
                        </IonChip>
                    </IonCol>
                    <IonCol size="auto">
                        <IonChip v-if="mutableRecipe.props.createdAt">
                            Created at {{ formatDate(mutableRecipe.props.createdAt) }}
                        </IonChip>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonCardHeader>

        <IonCardContent>
            <div class="flex">
                <IonGrid>
                    <IonRow>
                        <IonCol size="12">
                            <IonTextarea v-model.trim="mutableRecipe.description"
                                         :cols="6" :counter="true"
                                         :rows="3"
                                         :spellcheck="true" label="Description" label-placement="stacked"
                                         placeholder="e.g. The best recipe in Germany" wrap="soft"/>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol size="auto">
                            <IonInput v-model.trim="mutableRecipe.author" label="Author"
                                      label-placement="stacked"
                                      placeholder="e.g. Vasilij & Josef" type="text"/>
                        </IonCol>
                        <IonCol size="auto">
                            {{ mutableRecipe.getDuration() }} minutes
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </div>

            <IonInput v-model="mutableRecipe.props.imgUrl" label="Image URL" label-placement="stacked" type="url"/>

            <!-- Item icons -->
            <ItemList :items="mutableRecipe.getItems()"/>

            <IonItem class="tags-editor" lines="none">
                <!-- Tags -->
                <IonChip v-for="(tag, tagIndex) in (mutableRecipe.props.tags ?? [])" :key="tagIndex" class="tag">
                    <IonLabel>{{ tag }}</IonLabel>
                    <IonIcon :icon="closeCircleOutline"
                             @click="(mutableRecipe.props?.tags ?? []).splice(tagIndex, 1)"/>
                </IonChip>
                <!-- Add tag to the list -->
                <DropDownSearch :items="allTags" :reset-after="true" placeholder="e.g. vegan"
                                @select-item="mutableRecipe.addTag($event)" @add-item="mutableRecipe.addTag($event)">
                    <template #item="{ filteredItem }">
                        <IonChip class="tag">
                            <IonLabel>{{ filteredItem }}</IonLabel>
                        </IonChip>
                    </template>
                </DropDownSearch>
            </IonItem>
        </IonCardContent>
    </IonCard>

    <IonCard class="shadow">
        <IonCardContent>
            <IonTextarea :auto-grow="true" label="Steps from description"
                         placeholder="e.g. Add 500 gr flour and 5 egg to a bowl."
                         @keyup.enter="addStepsFromDescription($event.target.value)"/>
        </IonCardContent>
    </IonCard>

    <!-- Steps -->
    <IonButton fill="clear" @click="addStep(-1)">Add step</IonButton>
    <template v-for="(step, stepIndex) in mutableRecipe.steps" :key="stepIndex">
        <IonCard class="step-editor shadow">
            <IonCardHeader>
                <IonItem lines="none">
                    <IonCardTitle color="primary">Step {{ stepIndex + 1 }}</IonCardTitle>
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
                <ItemList :items="step.getItems()"/>


                <!-- Items -->
                <div class="items-editor">
                    <template v-for="(stepItem, itemIndex) in step.items"
                              :key="stepIndex + ' - ' + itemIndex + ' - ' + stepItem.name ?? ''">
                        <IonCard class="item-editor shadow">
                            <IonCardHeader>
                                <IonItem lines="none">
                                    <IonAvatar v-if="stepItem.imgUrl">
                                        <img :alt="`Image of ${stepItem.getName()}`" :src="stepItem.imgUrl"/>
                                    </IonAvatar>
                                    <IonChip v-if="stepItem._id || stepItem._tmpId">
                                        {{ stepItem._id ?? stepItem._tmpId }}
                                    </IonChip>
                                    <IonChip>
                                        {{ stepItem.type }}
                                    </IonChip>
                                </IonItem>
                                <IonCardTitle color="primary">
                                    <IonItem lines="none">
                                        <div slot="start">
                                            <DropDownSearch :custom-mapper="(item: Item) => item.getName()" :item="stepItem"
                                                            label="Name"
                                                            :items="allItems" placeholder="e.g. Baking powder"
                                                            @select-item="selectItem(stepIndex, itemIndex, $event)"
                                                            @add-item="addItem(stepIndex, itemIndex, $event)">
                                                <template #item="{ filteredItem }">
                                                    <IonLabel>
                                                        {{ (filteredItem as Item).name }} {{
                                                            (filteredItem as Item).getId()
                                                        }}
                                                    </IonLabel>
                                                </template>
                                            </DropDownSearch>
                                        </div>
                                        <div slot="end">
                                            <IonButton color="success" fill="solid"
                                                       @click="editItem(stepIndex, itemIndex)">
                                                <IonIcon :icon="create"/>
                                            </IonButton>
                                            <IonButton color="danger" fill="solid"
                                                       @click="removeItem(stepIndex, itemIndex)">
                                                <IonIcon :icon="trash"/>
                                            </IonButton>
                                        </div>
                                    </IonItem>
                                </IonCardTitle>
                            </IonCardHeader>

                            <IonCardContent>
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
                            </IonCardContent>
                        </IonCard>
                    </template>
                </div>
            </IonCardContent>
            <IonButton fill="clear" @click="addItem(stepIndex)">Add item</IonButton>
        </IonCard>
        <IonButton fill="clear" @click="addStep(stepIndex)">Add step</IonButton>
    </template>
    <IonItem>
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
import {Item, Recipe, Step, StepItem} from '@/tastebuddy/types';
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
import {computed, ComputedRef, defineComponent, PropType, Ref, ref, toRefs, watch} from 'vue';
import {closeCircleOutline, create, save, trash} from 'ionicons/icons';
import DropDownSearch from '../utility/DropDownSearch.vue';
import {descriptionToItems} from '@/utility/recipeParser';
import {formatDate} from '@/utility/util';
import ItemList from "@/components/recipe/ItemList.vue";

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
        DropDownSearch
    },
    setup(props) {
        const {recipe} = toRefs(props)

        const router = useIonRouter();

        const store = useRecipeStore();
        const allItems = computed(() => store.getItems);

        const mutableRecipe: Ref<Recipe> = ref<Recipe>(recipe.value)
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
         * Add steps to the recipe from a description
         * @param description description to parse
         */
        const addStepsFromDescription = (description: string) => mutableRecipe
            .value?.addSteps(Step.fromDescription(description))

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
         * Add items to a step from a description
         * @param stepIndex index of the step to add the items to
         */
        const addItemsFromDescription = (stepIndex: number) => {
            const description: string = mutableRecipe.value?.steps[stepIndex].description ?? '';
            descriptionToItems(description).forEach((stepItem: StepItem) => {
                mutableRecipe.value.addStep(Step.fromStepItems([stepItem], description))
            })
        }

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
         * Get all tags from the store
         */
        const allTags: ComputedRef<string[]> = computed(() => store.getTags);

        return {
            // recipe
            mutableRecipe, saveRecipe, deleteRecipe,
            // steps
            addStep, removeStep, addStepsFromDescription,
            // items
            allItems, addItem, editItem, selectItem, removeItem, addItemsFromDescription,
            // tags
            allTags,
            // icons
            closeCircleOutline, trash, create, save,
            // utility
            formatDate,
            // types
            Item
        };
    },
})
</script>

<style scoped>
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

.recipe-editor {
    margin: 10px;
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
    margin: 10px;
    width: 100%;
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