<template>
    <ion-card>
        <ion-card-header>
            <ion-text color="tertiary">
                ID {{ mutableRecipe._id }}
            </ion-text>
            <ion-card-title color="primary">
                <ion-item>
                    <ion-label color="primary">Recipe name</ion-label>
                    <ion-input color="light" v-model="mutableRecipe.name" />
                </ion-item>
            </ion-card-title>
            <ion-card-subtitle color="light">
                <ion-item>
                    <ion-label color="primary">Author</ion-label>
                    <ion-input color="light" v-model="mutableRecipe.author" />
                </ion-item>

                <ion-item>
                    <ion-label color="primary">Cooking time</ion-label>
                    <ion-input color="light" v-model.number="mutableRecipe.cookingTime" />
                </ion-item>
            </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content color="light">
            <ion-item>
                <ion-label color="primary">Description</ion-label>
                <ion-input color="light" v-model="mutableRecipe.description" />
            </ion-item>
        </ion-card-content>
    </ion-card>

    <!-- Steps -->
    <template v-for="(step, stepIndex) in steps" :key="stepIndex">
        <ion-card>
            <ion-card-header>
                <ion-card-title color="primary">Schritt {{ stepIndex + 1 }}</ion-card-title>
            </ion-card-header>

            <ion-item>
                <ion-label color="light">Description</ion-label>
                <ion-input color="light" v-model="step.description" />
            </ion-item>

            <ion-card-content>
                <!-- Items -->
                <template v-for="(stepItem, itemIndex) in step.items" :key="stepIndex + ' - ' + itemIndex">
                    <ion-card>
                        <ion-card-header>
                            <ion-card-title color="primary">
                                <ion-input v-model="stepItem.item.name" color="primary" />
                            </ion-card-title>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-item>
                                <ion-label color="light">URL</ion-label>
                                <ion-input color="light" v-model="stepItem.item.imgUrl" />
                            </ion-item>

                            <ion-item>
                                <ion-label color="light">Amount</ion-label>
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
                <ion-button fill="clear" @click="addItem(stepIndex)">Add item</ion-button>
                <ion-button fill="clear" @click="addStep()">Add step</ion-button>
            </ion-card-content>
        </ion-card>
        <ion-button @click="saveRecipe()">Save recipe</ion-button>
    </template>
</template>

<script lang="ts">
import { getFromAPI } from '@/api';
import { API_ROUTE } from '@/api/constants';
import { Recipe } from '@/api/types';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput, IonItem, IonLabel, IonCardSubtitle, IonSelect, IonSelectOption, IonText } from '@ionic/vue';
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
        IonCardSubtitle,
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

        const addStep = () => {
            steps.value.push({
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
