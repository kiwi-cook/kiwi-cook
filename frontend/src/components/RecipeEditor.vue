<template>
    <ion-card class="recipe-editor">
        <ion-card-header>
            <ion-card-header>
                <ion-card-title color="primary">
                    <ion-input v-model="mutableRecipe.name" color="primary" />
                </ion-card-title>
                <ion-chip color="tertiary" v-if="mutableRecipe._id">
                    ID {{ mutableRecipe._id }}
                </ion-chip>
            </ion-card-header>
        </ion-card-header>

        <ion-card-content color="light">
            <ion-item>
                <ion-label color="primary">Author</ion-label>
                <ion-input color="light" v-model.trim="mutableRecipe.author" />
            </ion-item>

            <ion-item>
                <ion-label color="primary">Cooking time (minutes)</ion-label>
                <ion-input color="light" min="1" max="9999" type="number" v-model.number="mutableRecipe.cookingTime" />
            </ion-item>

            <ion-item>
                <ion-label color="primary">Description</ion-label>
                <ion-input color="light" v-model.trim="mutableRecipe.description" />
            </ion-item>

            <ion-item>
                <ion-label color="primary">Image URL</ion-label>
                <ion-input color="light" v-model="mutableRecipe.imgUrl" />
            </ion-item>

            <ion-item>
                <!-- Tags -->
                <ion-chip v-for="(tag, index) in mutableRecipe.tags" :key="index" color="light">
                    <ion-label>{{ tag }}</ion-label>
                    <ion-icon :icon="closeCircleOutline" @click="mutableRecipe.tags.splice(index, 1)" />
                </ion-chip>
                <!-- Add tag to the list -->
                <ion-chip color="light">
                    <ion-input placeholder="Add tag" @keyup.enter="$event => { mutableRecipe.tags.push($event.target.value.toLowerCase()); $event.target.value = ''} " />
                </ion-chip>
            </ion-item>

            <!-- <ion-item>
                <ion-label color="primary">Servings</ion-label>
                <ion-input color="light" min="1" max="9999" type="number" v-model.number="mutableRecipe.servings" />
            </ion-item> -->
        </ion-card-content>
    </ion-card>

    <!-- Steps -->
    <ion-button fill="clear" @click="addStep(-1)">Add step</ion-button>
    <template v-for="(step, stepIndex) in steps" :key="stepIndex">

        <ion-card class="step-editor">
            <ion-card-header>
                <ion-card-title color="primary">Step {{ stepIndex + 1 }}</ion-card-title>
            </ion-card-header>

            <ion-item>
                <ion-label color="light">Description</ion-label>
                <ion-textarea color="light" placeholder="Type something here" :auto-grow="true"
                    v-model.trim="step.description"></ion-textarea>
            </ion-item>

            <ion-card-content class="items-editor">
                <!-- Items -->
                <template v-for="(stepItem, itemIndex) in step.items" :key="stepIndex + ' - ' + itemIndex">
                    <ion-card class="item-editor">
                        <ion-card-header>
                            <ion-thumbnail v-if="stepItem.item.imgUrl">
                                <img :src="stepItem.item.imgUrl" />
                            </ion-thumbnail>
                            <ion-card-title color="primary">
                                <DropDownSearch v-model="stepItem.item"
                                    @add-item="addNewItem(stepIndex, itemIndex, $event)"
                                    :custom-mapper="(item: Item) => item.name" :items="allItems" placeholder="Itemname">
                                    <template #item="{ filteredItem }">
                                        <ion-label>
                                            {{ filteredItem.name }} - {{ filteredItem._id }}
                                        </ion-label>
                                    </template>
                                </DropDownSearch>
                            </ion-card-title>
                            <ion-chip color="tertiary" v-if="stepItem.item._id">
                                ID {{ stepItem.item._id }}
                            </ion-chip>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-item>
                                <ion-label color="light" position="stacked">Image URL</ion-label>
                                <ion-input color="light" :placeholder="`Image URL for ${stepItem.item.name}`"
                                    v-model.trim="stepItem.item.imgUrl" />
                            </ion-item>

                            <ion-item>
                                <ion-label color="light" position="stacked">Amount</ion-label>
                                <ion-input color="light" type="number" min="0" max="9999"
                                    v-model.number="stepItem.amount" />
                            </ion-item>

                            <ion-item>
                                <ion-select color="light" placeholder="Unit" v-model="stepItem.unit">
                                    <ion-select-option value="ml">ml</ion-select-option>
                                    <ion-select-option value="l">l</ion-select-option>
                                    <ion-select-option value="g">g</ion-select-option>
                                    <ion-select-option value="kg">kg</ion-select-option>
                                    <ion-select-option value="pcs">pcs</ion-select-option>
                                </ion-select>
                            </ion-item>

                            <ion-item>
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
    <ion-button @click="saveRecipe()">{{ mutableRecipe._id ? 'Update' : 'Add' }} recipe</ion-button>
    <ion-button color="warning" @click="deleteRecipe()">Delete recipe</ion-button>
</template>

<script lang="ts">
import { getFromAPI } from '@/api';
import { API_ROUTE } from '@/api/constants';
import { Item, Recipe } from '@/api/types';
import { useTasteBuddyStore } from '@/storage';
import { IonIcon, IonThumbnail, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput, IonTextarea, IonItem, IonLabel, IonSelect, IonSelectOption, IonChip } from '@ionic/vue';
import { computed, defineComponent, PropType, ref, toRefs } from 'vue';
import { closeCircleOutline } from 'ionicons/icons';
import DropDownSearch from './utility/DropDownSearch.vue';

export default defineComponent({
    name: 'RecipeEditor',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
        IonIcon, IonThumbnail, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput, IonTextarea, IonItem, IonLabel, IonSelect, IonSelectOption, IonChip,
        DropDownSearch
    },
    setup(props) {
        const { recipe } = toRefs(props)

        const store = useTasteBuddyStore();
        const allItems = computed(() => store.state.items);

        const mutableRecipe = ref<Recipe>(recipe.value)
        const steps = computed(() => mutableRecipe.value.steps);

        const saveRecipe = () => {
            console.debug('Saving recipe ...', mutableRecipe.value.name)
            getFromAPI(API_ROUTE.ADD_RECIPE, { body: mutableRecipe.value })
        }

        const deleteRecipe = () => {
            console.debug('Deleting recipe ...', mutableRecipe.value.name)
            if (!mutableRecipe.value._id) {
                console.error('Cannot delete recipe without id')
                return;
            }
            getFromAPI(API_ROUTE.DELETE_RECIPE, { formatObject: { RECIPE_ID: mutableRecipe.value._id! } })
        }

        const addStep = (stepIndex: number) => {
            steps.value.splice(stepIndex + 1, 0, {
                description: '',
                items: [],
            });
        };

        const addItem = (stepIndex: number) => {
            steps.value[stepIndex].items.push({
                amount: 0,
                unit: '',
                item: {
                    name: '',
                    type: '',
                    imgUrl: '',
                },
            });
        };

        const addNewItem = (stepIndex: number, itemIndex: number, item: string) => {
            steps.value[stepIndex].items[itemIndex].item = {
                name: item,
                type: 'ingredient',
                imgUrl: '',
            };
        }

        return {
            // recipe
            mutableRecipe, saveRecipe, deleteRecipe,
            // steps
            steps, addStep,
            // items
            allItems, addNewItem, addItem,
            // icons
            closeCircleOutline,
        };
    },
})
</script>

<style>
.step-editor,
.item-editor {
    /* nice shadow with light background and round corners */
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2), 0 0 10px 0 rgba(0, 0, 0, 0.19);
}

.recipe-editor {
    margin: 10px;
}

.step-editor {
    margin: 10px;
}

.items-editor {
    margin: 10px;
    max-width: fit-content;
    display: flex;
}

.item-editor {
    margin: 10px;
    max-width: fit-content;
}
</style>