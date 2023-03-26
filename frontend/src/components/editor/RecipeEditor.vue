<template>
    <ion-card class="recipe-editor">
        <ion-card-header>
            <ion-grid>
                <ion-row>
                    <ion-col size="auto">
                        <ion-avatar v-if="mutableRecipe.imgUrl" class="recipe-preview-img">
                            <img :src="mutableRecipe.imgUrl" :alt="`Image of ${mutableRecipe.name}`" />
                        </ion-avatar>
                    </ion-col>
                    <ion-col size="3">
                        <ion-card-title color="light">
                            <ion-input :maxlength="40" :value="mutableRecipe.name"
                                @keyup.enter="mutableRecipe.name = $event.target.value"
                                @ion-blur="mutableRecipe.name = ($event.target.value ?? '').toString()" />
                        </ion-card-title>
                    </ion-col>
                    <ion-col size="auto">
                        <ion-chip v-if="mutableRecipe._id || mutableRecipe._tmpId" color="light">
                            {{ mutableRecipe._id ?? mutableRecipe._tmpId }}
                        </ion-chip>
                    </ion-col>
                    <ion-col size="auto">
                        <ion-chip v-if="mutableRecipe.createdAt" color="light">
                            Created at {{ formatDate(mutableRecipe.createdAt) }}
                        </ion-chip>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-card-header>

        <ion-card-content>
            <div class="flex">
                <AttributeEditor label="Description">
                    <ion-textarea v-model.lazy.trim="mutableRecipe.description"
                        placeholder="e.g. The best recipe in Germany" />
                </AttributeEditor>

                <AttributeEditor label="Author">
                    <ion-input v-model.trim="mutableRecipe.author" placeholder="e.g. Vasilij & Josef" />
                </AttributeEditor>

                <AttributeEditor label="Cooking time (minutes)">
                    <ion-input v-model.number="mutableRecipe.cookingTime" max="9999" min="1" type="number" />
                </AttributeEditor>
            </div>

            <AttributeEditor label="Image URL">
                <ion-input v-model="mutableRecipe.imgUrl" />
            </AttributeEditor>

            <!-- Item icons -->
            <SmallItemContainer :items="mutableRecipe.getStepItems()" />

            <ion-item class="tags-editor" lines="none">
                <!-- Tags -->
                <ion-chip v-for="(tag, index) in mutableRecipe.tags" :key="index" class="tag" color="light">
                    <ion-label>{{ tag }}</ion-label>
                    <ion-icon :icon="closeCircleOutline" @click="mutableRecipe.tags.splice(index, 1)" />
                </ion-chip>
                <!-- Add tag to the list -->
                <ion-chip class="tag" color="light">
                    <ion-input placeholder="Add tag"
                        @keyup.enter="mutableRecipe.addTag($event.target.value.toLowerCase()); $event.target.value = ''" />
                </ion-chip>
            </ion-item>

            <!-- <ion-item>
                <ion-label color="primary">Servings</ion-label>
                <ion-input  min="1" max="9999" type="number" v-model.number="mutableRecipe.servings" />
            </ion-item> -->
        </ion-card-content>
    </ion-card>

    <ion-card class="shadow">
        <ion-card-content>
            <ion-item lines="none">
                <ion-label color="primary" position="stacked">Steps from description</ion-label>
                <ion-textarea placeholder="e.g. Add 500 gr flour and 5 egg to a bowl."
                    @keyup.enter="addStepsFromDescription($event.target.value)" />
            </ion-item>
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
                <AttributeEditor label="Description">
                    <ion-textarea v-model.trim="step.description" :auto-grow="true"
                        placeholder="e.g. Mix the ingredients together" @keyup.enter="addItemsFromDescription(stepIndex)" />
                </AttributeEditor>

                <AttributeEditor label="Preparation time (minutes)">
                    <ion-input v-model.number="step.preparationTime" max="9999" min="1" type="number" />
                </AttributeEditor>

                <AttributeEditor label="Image URL">
                    <ion-input v-model.trim="step.imgUrl" :placeholder="`e.g. https://source.unsplash.com/`" />
                </AttributeEditor>

                <!-- Item icons -->
                <SmallItemContainer :items="step.getStepItems()" />


                <!-- Items -->
                <div class="items-editor">
                    <template v-for="(stepItem, itemIndex) in step.items"
                        :key="stepIndex + ' - ' + itemIndex + ' - ' + stepItem.name ?? ''">
                        <ion-card class="item-editor shadown">
                            <ion-card-header>
                                <ion-item lines="none">
                                    <ion-avatar v-if="stepItem.item.imgUrl">
                                        <img :src="stepItem.item.imgUrl" :alt="`Image of ${stepItem.item.name}`" />
                                    </ion-avatar>
                                    <ion-chip v-if="stepItem.item._id || stepItem.item._tmpId" color="light">
                                        {{ stepItem.item._id ?? stepItem.item._tmpId }}
                                    </ion-chip>
                                </ion-item>
                                <ion-card-title color="primary">
                                    <ion-item lines="none">
                                        <div slot="start">
                                            <ion-label position="stacked">Name</ion-label>
                                            <DropDownSearch v-model="stepItem.item"
                                                :custom-mapper="(item: Item) => item.name" :items="allItems"
                                                placeholder="e.g. Baking powder"
                                                @add-item="addItem(stepIndex, itemIndex, $event)">
                                                <template #item="{ filteredItem }">
                                                    <ion-label>
                                                        {{ filteredItem.name }} {{
                                                            filteredItem._id ? ' - ' +
                                                        filteredItem._id :
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
                                    <ion-label position="stacked">Image URL</ion-label>
                                    <ion-input v-model.trim="stepItem.item.imgUrl"
                                        :placeholder="`e.g. https://source.unsplash.com/`" />
                                </ion-item>

                                <ion-item lines="none">
                                    <ion-grid>
                                        <ion-row>
                                            <ion-col size="auto">
                                                <ion-input v-model.number="stepItem.amount" inputmode="numeric" max="9999"
                                                    min="0" type="number" />
                                            </ion-col>
                                            <ion-col size="8">
                                                <ion-select v-model="stepItem.unit" placeholder="Unit">
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
                                    <ion-select v-model="stepItem.item.type" placeholder="Type">
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
import { Item, Recipe, Step, StepItem } from '@/api/types';
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
import { computed, defineComponent, PropType, Ref, ref, toRefs, watch } from 'vue';
import { closeCircleOutline } from 'ionicons/icons';
import DropDownSearch from '../utility/DropDownSearch.vue';
import SmallItemContainer from '@/components/item/SmallItemContainer.vue';
import { descriptionToItems } from '@/utility/recipeParser';
import AttributeEditor from './AttributeEditor.vue';
import { formatDate } from '@/utility/util';

export default defineComponent({
    name: 'RecipeEditor',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
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
        SmallItemContainer,
        AttributeEditor
    },
    emits: ['remove'],
    setup(props) {
        const { recipe } = toRefs(props)

        const store = useTasteBuddyStore();
        const allItems = computed(() => store.getters.getItems);

        const mutableRecipe: Ref<Recipe> = ref<Recipe>(recipe.value)
        // update recipe and steps when prop changes
        watch(recipe, (newRecipe: Recipe) => {
            mutableRecipe.value = newRecipe
        }, { deep: true })

        const saveRecipe = () => mutableRecipe.value.save(store)
        const deleteRecipe = () => mutableRecipe.value.delete(store)
        const addStep = (stepIndex: number) => mutableRecipe.value.addStep(undefined, stepIndex)
        const addStepsFromDescription = (description: string) => mutableRecipe.value.addSteps(Step.fromDescription(description))
        const removeStep = (stepIndex: number) => mutableRecipe.value.removeStep(stepIndex)
        const addItem = (stepIndex?: number, itemIndex?: number, itemName?: string) => mutableRecipe.value.addItem(stepIndex, itemIndex, Item.newItemFromName(itemName)).item.update(store)
        const addItemsFromDescription = (stepIndex: number) => {
            const description: string = mutableRecipe.value.steps[stepIndex].description;
            descriptionToItems(description).forEach((stepItem: StepItem) => {
                mutableRecipe.value.addStep(Step.fromStepItems([stepItem], description))
            })
        }
        const removeItem = (stepIndex: number, itemIndex: number) => mutableRecipe.value.steps[stepIndex].items.splice(itemIndex, 1);

        return {
            // recipe
            mutableRecipe, saveRecipe, deleteRecipe,
            // steps
            addStep, removeStep, addStepsFromDescription,
            // items
            allItems, addItem, removeItem, addItemsFromDescription,
            // icons
            closeCircleOutline,
            // utility
            formatDate
        };
    },
})
</script>

<style scoped>
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