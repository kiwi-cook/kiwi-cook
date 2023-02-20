<template>
    <ion-card class="recipe-editor">
        <ion-card-header>
            <ion-card-header>
                <ion-card-title color="primary">
                    <ion-input v-model="mutableRecipe.name" color="primary" />
                </ion-card-title>
                <ion-text color="tertiary">
                    ID {{ mutableRecipe._id }}
                </ion-text>
            </ion-card-header>
        </ion-card-header>

        <ion-card-content color="light">
            <ion-item>
                <ion-label color="primary">Author</ion-label>
                <ion-input color="light" v-model="mutableRecipe.author" />
            </ion-item>

            <ion-item>
                <ion-label color="primary">Cooking time</ion-label>
                <ion-input color="light" v-model.number="mutableRecipe.cookingTime" />
            </ion-item>

            <ion-item>
                <ion-label color="primary">Description</ion-label>
                <ion-input color="light" v-model="mutableRecipe.description" />
            </ion-item>
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
                <ion-input color="light" v-model="step.description" />
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
                                <ion-input v-model="stepItem.item.name" placeholder="Itemname" color="primary" />
                            </ion-card-title>
                            <ion-text color="tertiary">
                                ID {{ stepItem.item._id }}
                            </ion-text>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-item>
                                <ion-label color="light" position="stacked">URL</ion-label>
                                <ion-input color="light" :placeholder="`Image URL for ${stepItem.item.name}`"
                                    v-model="stepItem.item.imgUrl" />
                            </ion-item>

                            <ion-item>
                                <ion-label color="light" position="stacked">Amount</ion-label>
                                <ion-input color="light" v-model.number="stepItem.amount" />
                            </ion-item>

                            <ion-item>
                                <ion-select color="light" placeholder="Unit">
                                    <ion-select-option value="ml">ml</ion-select-option>
                                    <ion-select-option value="g">g</ion-select-option>
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
    <ion-button @click="saveRecipe()">Save recipe</ion-button>
</template>

<script lang="ts">
import { getFromAPI } from '@/api';
import { API_ROUTE } from '@/api/constants';
import { Recipe } from '@/api/types';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonText } from '@ionic/vue';
import { computed, defineComponent, PropType, ref, toRefs } from 'vue';

export default defineComponent({
    name: 'RecipeEditor',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
        IonText,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonItem,
        IonLabel,
        IonInput,
        IonSelect,
        IonSelectOption,
        IonButton
    },
    setup(props) {
        const { recipe } = toRefs(props)

        const mutableRecipe = ref<Recipe>(recipe.value)
        const steps = computed(() => mutableRecipe.value.steps);

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
                    _id: '',
                    name: '',
                    type: '',
                    imgUrl: '',
                },
            });
        };

        const saveRecipe = () => {
            console.debug('Saving recipe ...', mutableRecipe.value)
            getFromAPI(API_ROUTE.ADD_RECIPE, { body: mutableRecipe.value })
        }

        return {
            mutableRecipe, steps,
            addStep, addItem, saveRecipe
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