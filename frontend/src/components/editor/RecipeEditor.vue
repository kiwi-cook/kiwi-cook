<template>
    <ion-card class="recipe-editor">
        <ion-card-header>
            <ion-grid>
                <ion-row>
                    <ion-col size="auto">
                        <ion-avatar v-if="mutableRecipe.imgUrl" class="recipe-img">
                            <img :src="mutableRecipe.imgUrl" />
                        </ion-avatar>
                    </ion-col>
                    <ion-col size="3">
                        <ion-card-title>
                            <ion-input v-model="mutableRecipe.name" :maxlength="40" color="light" />
                        </ion-card-title>
                    </ion-col>
                    <ion-col size="auto">
                        <ion-chip color="light" v-if="mutableRecipe._id">
                            {{ mutableRecipe._id }}
                        </ion-chip>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-card-header>

        <ion-card-content>
            <ion-item lines="none">
                <ion-label color="primary">Description</ion-label>
                <ion-input color="light" placeholder="e.g. The best recipe in Germany"
                    v-model.trim="mutableRecipe.description" />
            </ion-item>

            <ion-item lines="none">
                <ion-label color="primary">Author</ion-label>
                <ion-input color="light" placeholder="e.g. Vasilij & Josef" v-model.trim="mutableRecipe.author" />
            </ion-item>

            <ion-item lines="none">
                <ion-label color="primary">Cooking time (minutes)</ion-label>
                <ion-input color="light" min="1" max="9999" type="number" v-model.number="mutableRecipe.cookingTime" />
            </ion-item>

            <ion-item lines="none">
                <ion-label color="primary">Image URL</ion-label>
                <ion-input color="light" v-model="mutableRecipe.imgUrl" />
            </ion-item>

            <ion-item lines="none" class="tags-editor">
                <!-- Tags -->
                <ion-chip v-for="(tag, index) in mutableRecipe.tags" :key="index" color="light" class="tag">
                    <ion-label>{{ tag }}</ion-label>
                    <ion-icon :icon="closeCircleOutline" @click="mutableRecipe.tags.splice(index, 1)" />
                </ion-chip>
                <!-- Add tag to the list -->
                <ion-chip color="light" class="tag">
                    <ion-input placeholder="Add tag"
                        @keyup.enter="$event => { mutableRecipe.tags.push($event.target.value.toLowerCase()); $event.target.value = '' }" />
                </ion-chip>
            </ion-item>

            <!-- <ion-item>
                <ion-label color="primary">Servings</ion-label>
                <ion-input color="light" min="1" max="9999" type="number" v-model.number="mutableRecipe.servings" />
            </ion-item> -->
        </ion-card-content>
    </ion-card>

    <ion-card>
        <ion-card-content>
            <ion-item lines="none">
                <ion-label color="primary">Steps from description</ion-label>
                <ion-textarea color="light" @keyup.enter="addStepsFromDescription($event.target.value)" />
            </ion-item>
        </ion-card-content>
    </ion-card>

    <!-- Steps -->
    <ion-button fill="clear" @click="addStep(-1)">Add step</ion-button>
    <template v-for="(step, stepIndex) in steps" :key="stepIndex">

        <ion-card class="step-editor">
            <ion-card-header>
                <ion-item lines="none">
                    <ion-card-title color="primary">Step {{ stepIndex + 1 }}</ion-card-title>
                    <ion-button fill="solid" color="danger" @click="removeStep(stepIndex)">
                        Remove step
                    </ion-button>
                </ion-item>
            </ion-card-header>

            <ion-item lines="none">
                <ion-label color="primary">Description</ion-label>
                <ion-textarea color="light" placeholder="e.g. Mix the ingredients together" :auto-grow="true"
                    v-model.trim="step.description" @keyup.enter="addItemsFromDescription(stepIndex)" />
            </ion-item>

            <ion-card-content class="items-editor">
                <!-- Items -->
                <template v-for="(stepItem, itemIndex) in step.items" :key="stepIndex + ' - ' + itemIndex + ' - ' + stepItem.name ?? ''">
                    <ion-card class="item-editor">
                        <ion-card-header>
                            <ion-item lines="none">
                                <ion-avatar v-if="stepItem.item.imgUrl">
                                    <img :src="stepItem.item.imgUrl" />
                                </ion-avatar>
                                <ion-chip color="light" v-if="stepItem.item._id">
                                    {{ stepItem.item._id }}
                                </ion-chip>
                            </ion-item>
                            <ion-card-title color="primary">
                                <ion-item lines="none">
                                    <div slot="start">
                                        <ion-label color="light" position="stacked">Item</ion-label>
                                        <DropDownSearch v-model="stepItem.item"
                                            @add-item="addNewItem(stepIndex, itemIndex, $event)"
                                            :custom-mapper="(item: Item) => item.name" :items="allItems"
                                            placeholder="e.g. Baking powder">
                                            <template #item="{ filteredItem }">
                                                <ion-label color="light">
                                                    {{ filteredItem.name }} - {{ filteredItem._id }}
                                                </ion-label>
                                            </template>
                                        </DropDownSearch>
                                    </div>
                                    <div slot="end">
                                        <ion-button fill="solid" color="danger" @click="removeItem(stepIndex, itemIndex)">
                                            Remove item
                                        </ion-button>
                                    </div>
                                </ion-item>
                            </ion-card-title>

                        </ion-card-header>

                        <ion-card-content>
                            <ion-item lines="none">
                                <ion-label color="light" position="stacked">Image URL</ion-label>
                                <ion-input color="light" :placeholder="`e.g. https://source.unsplash.com/`"
                                    v-model.trim="stepItem.item.imgUrl" />
                            </ion-item>

                            <ion-item lines="none">
                                <ion-grid>
                                    <ion-row>
                                        <ion-col size="auto">
                                            <ion-input color="light" type="number" inputmode="numeric" min="0" max="9999"
                                                v-model.number="stepItem.amount" />
                                        </ion-col>
                                        <ion-col size="8">
                                            <ion-select placeholder="Unit" v-model="stepItem.unit">
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
                                <ion-select color="light" placeholder="Type" v-model="stepItem.item.type">
                                    <ion-select-option value="ingredient">Ingredient</ion-select-option>
                                    <ion-select-option value="tool">Tool</ion-select-option>
                                </ion-select>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>
                </template>
            </ion-card-content>
            <ion-button fill="clear" @click="addItem(stepIndex)">Add item</ion-button>
        </ion-card>
        <ion-button fill="clear" @click="addStep(stepIndex)">Add step</ion-button>
    </template>
    <ion-item>
        <ion-button @click="saveRecipe()">{{ mutableRecipe._id ? 'Update' : 'Save' }} recipe</ion-button>
        <ion-button color="danger" fill="solid" @click="removeRecipe()">{{ mutableRecipe._id ? 'Delete' : 'Remove' }} recipe</ion-button>
    </ion-item>
</template>

<script lang="ts">
import { getFromAPI } from '@/api';
import { API_ROUTE } from '@/api/constants';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Item, Recipe } from '@/api/types';
import { useTasteBuddyStore } from '@/storage';
import { IonGrid, IonRow, IonCol, IonIcon, IonAvatar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput, IonTextarea, IonItem, IonLabel, IonSelect, IonSelectOption, IonChip } from '@ionic/vue';
import { computed, defineComponent, PropType, ref, toRefs } from 'vue';
import { closeCircleOutline } from 'ionicons/icons';
import DropDownSearch from '../utility/DropDownSearch.vue';
import { descriptionToItems, descriptionToSteps } from '@/utility/recipeParser';

export default defineComponent({
    name: 'RecipeEditor',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
        IonGrid, IonRow, IonCol, IonIcon, IonAvatar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput, IonTextarea, IonItem, IonLabel, IonSelect, IonSelectOption, IonChip,
        DropDownSearch
    },
    emits: ['remove'],
    setup(props, ctx) {
        const { recipe } = toRefs(props)

        const store = useTasteBuddyStore();
        const allItems = computed(() => store.state.items);

        const mutableRecipe = ref<Recipe>(recipe.value)
        const steps = computed(() => mutableRecipe.value.steps);

        const saveRecipe = () => {
            console.debug('Saving recipe ...', mutableRecipe.value.name)
            getFromAPI(API_ROUTE.ADD_RECIPE, { body: mutableRecipe.value })
        }

        const removeRecipe = () => {
            console.debug('Deleting recipe ...', mutableRecipe.value.name)
            if (typeof mutableRecipe.value._id !== 'undefined') {
                // delete recipe from API
                getFromAPI(API_ROUTE.DELETE_RECIPE, { formatObject: { RECIPE_ID: mutableRecipe.value._id } })
            }
            // remove recipe from parent
            ctx.emit('remove')
        }

        const addStep = (stepIndex: number) => {
            steps.value.splice(stepIndex + 1, 0, {
                description: '',
                items: [],
            });
        };

        const removeStep = (stepIndex: number) => {
            steps.value.splice(stepIndex, 1);
        };

        const addItem = (stepIndex: number) => {
            steps.value[stepIndex].items.push({
                amount: 1,
                unit: 'pcs',
                item: {
                    name: '',
                    type: '',
                    imgUrl: '',
                },
            });
        };

        const removeItem = (stepIndex: number, itemIndex: number) => {
            steps.value[stepIndex].items.splice(itemIndex, 1);
        };

        const addNewItem = (stepIndex: number, itemIndex: number, item: string) => {
            steps.value[stepIndex].items[itemIndex].item = {
                name: item,
                type: 'ingredient',
                imgUrl: '',
            };
        }

        const addItemsFromDescription = (stepIndex: number) => {
            const description = steps.value[stepIndex].description;
            recipe.value.steps[stepIndex].items.push(...descriptionToItems(description))
        }

        const addStepsFromDescription = (description: string) => {
            mutableRecipe.value.steps.push(...descriptionToSteps(description))
        }

        return {
            // recipe
            mutableRecipe, saveRecipe, removeRecipe,
            // steps
            steps, addStep, removeStep, addStepsFromDescription,
            // items
            allItems, addNewItem, addItem, removeItem, addItemsFromDescription,
            // icons
            closeCircleOutline,
        };
    },
})
</script>

<style scoped>
ion-card {
    /* nice shadow with light background and round corners */
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2), 0 0 10px 0 rgba(0, 0, 0, 0.19);
}

.recipe-editor {
    margin: 10px;
}

ion-avatar.recipe-img {
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