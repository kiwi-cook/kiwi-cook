<template>
    <ion-card class="recipe-editor" v-if="mutableRecipe">
        <ion-card-header>
            <ion-grid>
                <ion-row>
                    <ion-col size="auto">
                        <ion-avatar v-if="mutableRecipe.props.imgUrl" class="recipe-preview-img">
                            <img :alt="`Image of ${mutableRecipe.name}`" :src="mutableRecipe.props.imgUrl" />
                        </ion-avatar>
                    </ion-col>
                    <ion-col size="3">
                        <ion-card-title color="light">
                            <ion-input :maxlength="40" :value="mutableRecipe.name" type="text"
                                @keyup.enter="mutableRecipe.name = $event.target.value"
                                @ion-blur="mutableRecipe.name = ($event.target.value ?? '').toString()"
                                aria-label="Recipe name" />
                        </ion-card-title>
                    </ion-col>
                    <ion-col size="auto">
                        <ion-chip v-if="mutableRecipe._id || mutableRecipe._tmpId" color="light">
                            {{ mutableRecipe._id ?? mutableRecipe._tmpId }}
                        </ion-chip>
                    </ion-col>
                    <ion-col size="auto">
                        <ion-chip v-if="mutableRecipe.props.createdAt" color="light">
                            Created at {{ formatDate(mutableRecipe.props.createdAt) }}
                        </ion-chip>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-card-header>

        <ion-card-content>
            <div class="flex">
                <ion-grid>
                    <ion-row>
                        <ion-col size="12">
                            <ion-textarea v-model.trim="mutableRecipe.description"
                                placeholder="e.g. The best recipe in Germany" label="Description" label-placement="stacked"
                                :counter="true" :spellcheck="true" wrap="soft" :rows="3" :cols="6" />
                        </ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col size="auto">
                            <ion-input v-model.trim="mutableRecipe.author" placeholder="e.g. Vasilij & Josef" type="text"
                                label="Author" label-placement="stacked" />
                        </ion-col>
                        <ion-col size="auto">
                            {{ mutableRecipe.getDuration() }} minutes
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>

            <ion-input v-model="mutableRecipe.props.imgUrl" type="url" label="Image URL" label-placement="stacked" />

            <!-- Item icons -->
            <SmallItemList :items="mutableRecipe.getStepItems()" />

            <ion-item class="tags-editor" lines="none">
                <!-- Tags -->
                <ion-chip v-for="(tag, tagIndex) in (mutableRecipe.props.tags ?? [])" :key="tagIndex" class="tag"
                    color="light">
                    <ion-label>{{ tag }}</ion-label>
                    <ion-icon :icon="closeCircleOutline" @click="(mutableRecipe.props?.tags ?? []).splice(tagIndex, 1)" />
                </ion-chip>
                <!-- Add tag to the list -->
                <DropDownSearch :items="allTags" placeholder="e.g. vegan" @select-item="mutableRecipe.addTag($event)"
                    @add-item="mutableRecipe.addTag($event)" :reset-after="true">
                    <template #item="{ filteredItem }">
                        <ion-chip class="tag" color="light">
                            <ion-label>{{ filteredItem }}</ion-label>
                        </ion-chip>
                    </template>
                </DropDownSearch>
            </ion-item>

            <!-- <ion-item>
                <ion-label color="primary">Servings</ion-label>
                <ion-input  min="1" max="9999" type="number" v-model.number="mutableRecipe.servings" />
            </ion-item> -->
        </ion-card-content>
    </ion-card>

    <ion-card class="shadow">
        <ion-card-content>
            <ion-textarea placeholder="e.g. Add 500 gr flour and 5 egg to a bowl." :auto-grow="true"
                @keyup.enter="addStepsFromDescription($event.target.value)" label="Steps from description" />
        </ion-card-content>
    </ion-card>

    <!-- Steps -->
    <ion-button fill="clear" @click="addStep(-1)">Add step</ion-button>
    <template v-for="(step, stepIndex) in mutableRecipe.steps" :key="stepIndex">
        <ion-card class="step-editor shadow">
            <ion-card-header>
                <ion-item lines="none">
                    <ion-card-title color="primary">Step {{ stepIndex + 1 }}</ion-card-title>
                    <ion-button color="danger" fill="solid" @click="removeStep(stepIndex)">
                        Remove step
                    </ion-button>
                </ion-item>
            </ion-card-header>

            <ion-card-content>
                <ion-textarea v-model.trim="step.description" placeholder="e.g. Mix the ingredients together"
                    label="Description" label-placement="stacked" :counter="true" :spellcheck="true" wrap="soft" :rows="3"
                    :cols="6" />

                <ion-input v-model.number="step.duration" max="9999" min="1" type="number"
                    label="Preparation time (minutes)" label-placement="stacked" />

                <ion-input v-model.trim="step.imgUrl" :placeholder="`e.g. https://source.unsplash.com/`" type="url"
                    label="Image URL" label-placement="stacked" />

                <!-- Item icons -->
                <SmallItemContainer :items="step.getStepItems()" />


                <!-- Items -->
                <div class="items-editor">
                    <template v-for="(stepItem, itemIndex) in step.items"
                        :key="stepIndex + ' - ' + itemIndex + ' - ' + stepItem.name ?? ''">
                        <ion-card class="item-editor shadow">
                            <ion-card-header>
                                <ion-item lines="none">
                                    <ion-avatar v-if="stepItem.imgUrl">
                                        <img :alt="`Image of ${stepItem.name}`" :src="stepItem.imgUrl" />
                                    </ion-avatar>
                                    <ion-chip v-if="stepItem._id || stepItem._tmpId" color="light">
                                        {{ stepItem._id ?? stepItem._tmpId }}
                                    </ion-chip>
                                </ion-item>
                                <ion-card-title color="primary">
                                    <ion-item lines="none">
                                        <div slot="start">
                                            <ion-label position="stacked">Name</ion-label>
                                            <DropDownSearch :item="stepItem" :custom-mapper="(item: Item) => item.name"
                                                :items="allItems" placeholder="e.g. Baking powder"
                                                @select-item="selectItem(stepIndex, itemIndex, $event)"
                                                @add-item="addItem(stepIndex, itemIndex, $event)">
                                                <template #item="{ filteredItem }">
                                                    <ion-label>
                                                        {{ (filteredItem as Item).name }} {{
                                                            (filteredItem as Item)._id ? ' - ' +
                                                        (filteredItem as Item)._id :
                                                            ''
                                                        }}
                                                    </ion-label>
                                                </template>
                                            </DropDownSearch>
                                        </div>
                                        <div slot="end">
                                            <ion-button color="danger" fill="solid"
                                                @click="removeItem(stepIndex, itemIndex)">
                                                Remove item
                                            </ion-button>
                                        </div>
                                    </ion-item>
                                </ion-card-title>
                            </ion-card-header>

                            <ion-card-content>
                                <ion-item lines="none">
                                    <ion-input v-model.trim="stepItem.imgUrl"
                                        :placeholder="`e.g. https://source.unsplash.com/`" type="url" label="Image URL"
                                        label-placement="stacked" />
                                </ion-item>

                                <ion-item lines="none">
                                    <ion-grid>
                                        <ion-row>
                                            <ion-col size="auto">
                                                <ion-input v-model.number="stepItem.amount" inputmode="numeric"
                                                    label="Amount" label-placement="floating" max="9999" min="0"
                                                    type="number" />
                                            </ion-col>
                                            <ion-col size="8">
                                                <ion-select v-model="stepItem.unit" label="Unit" label-placement="floating"
                                                    placeholder="Unit">
                                                    <ion-select-option value="ml">ml</ion-select-option>
                                                    <ion-select-option value="l">l</ion-select-option>
                                                    <ion-select-option value="g">g</ion-select-option>
                                                    <ion-select-option value="kg">kg</ion-select-option>
                                                    <ion-select-option value="pcs">pcs</ion-select-option>
                                                </ion-select>
                                            </ion-col>
                                        </ion-row>
                                    </ion-grid>
                                </ion-item>

                                <ion-item lines="none">
                                    <ion-select v-model="stepItem.type" label="Type" label-placement="floating" interface="popover"
                                        placeholder="Type" color="light">
                                        <ion-select-option value="ingredient">Ingredient</ion-select-option>
                                        <ion-select-option value="tool">Tool</ion-select-option>
                                    </ion-select>
                                </ion-item>
                            </ion-card-content>
                        </ion-card>
                    </template>
                </div>
            </ion-card-content>
            <ion-button fill="clear" @click="addItem(stepIndex)">Add item</ion-button>
        </ion-card>
        <ion-button fill="clear" @click="addStep(stepIndex)">Add step</ion-button>
    </template>
    <ion-item>
        <ion-button @click="saveRecipe()">Save recipe</ion-button>
        <ion-button color="danger" fill="solid" @click="deleteRecipe()">Delete recipe</ion-button>
    </ion-item>
</template>

<script lang="ts">
import { Item, Recipe, Step, StepItem } from '@/tastebuddy/types';
import { useTasteBuddyStore } from '@/storage';
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
    IonTextarea
} from '@ionic/vue';
import { computed, ComputedRef, defineComponent, PropType, Ref, ref, toRefs, watch } from 'vue';
import { closeCircleOutline } from 'ionicons/icons';
import DropDownSearch from '../utility/DropDownSearch.vue';
import SmallItemContainer from '@/components/item/SmallItemContainer.vue';
import { descriptionToItems } from '@/utility/recipeParser';
import { formatDate } from '@/utility/util';
import SmallItemList from "@/components/item/SmallItemList.vue";
import { useIonRouter } from '@ionic/vue';

export default defineComponent({
    name: 'RecipeEditor',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
        SmallItemList,
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
        SmallItemContainer
    },
    setup(props) {
        const { recipe } = toRefs(props)

        const router = useIonRouter();

        const store = useTasteBuddyStore();
        const allItems = computed(() => store.getters.getItems);

        const mutableRecipe: Ref<Recipe> = ref<Recipe>(recipe.value)
        // update recipe and steps when prop changes
        watch(recipe, (newRecipe: Recipe) => {
            mutableRecipe.value = newRecipe
        }, { immediate: true })

        /**
         * Save recipe to the Backend API
         */
        const saveRecipe = () => mutableRecipe.value?.save(store)

        /**
         * Delete recipe from the Backend API
         * Redirect to SavedRecipes
         */
        const deleteRecipe = () => mutableRecipe.value?.delete(store).then(() => {
            router.push({ name: 'SavedRecipes' })
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
        const addStepsFromDescription = (description: string) => mutableRecipe.value?.addSteps(Step.fromDescription(description))

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
        const addItem = (stepIndex?: number, itemIndex?: number, itemName?: string) => mutableRecipe.value?.addItem(stepIndex, itemIndex, Item.newItemFromName(itemName)).item.update(store)

        /**
         * Select an item in a step and update it
         * @param stepIndex index of the step to select the item in
         * @param itemIndex index of the item to select
         * @param item item to update
         */
        const selectItem = (stepIndex: number, itemIndex: number, item: Item) => mutableRecipe.value?.steps[stepIndex].items[itemIndex].updateItem(item)

        /**
         * Add items to a step from a description
         * @param stepIndex index of the step to add the items to
         */
        const addItemsFromDescription = (stepIndex: number) => {
            const description: string = mutableRecipe.value?.steps[stepIndex].description;
            descriptionToItems(description).forEach((stepItem: StepItem) => {
                mutableRecipe.value.addStep(Step.fromStepItems([stepItem], description))
            })
        }

        /**
         * Remove an item from a step
         * @param stepIndex index of the step to remove the item from
         * @param itemIndex index of the item to remove
         */
        const removeItem = (stepIndex: number, itemIndex: number) => mutableRecipe.value?.steps[stepIndex].items.splice(itemIndex, 1);

        /**
         * Get all tags from the store
         */
        const allTags: ComputedRef<string[]> = computed(() => store.getters.getTags);

        return {
            // recipe
            mutableRecipe, saveRecipe, deleteRecipe,
            // steps
            addStep, removeStep, addStepsFromDescription,
            // items
            allItems, addItem, selectItem, removeItem, addItemsFromDescription,
            // tags
            allTags,
            // icons
            closeCircleOutline,
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
    max-width: fit-content;
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