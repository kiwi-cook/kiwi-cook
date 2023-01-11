<template>
    <!-- Editor for recipes using cards -->
    <ion-card>
        <img :alt="'Image of ' + mutableRecipe.name" :src="mutableRecipe.imgUrl" />
        <ion-card-header>
            <ion-card-title color="primary">{{ mutableRecipe.name }}</ion-card-title>
            <ion-card-subtitle color="light">Von {{ mutableRecipe.author }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content color="light">
            <ion-item>
                <ion-label color="light">Description</ion-label>
                <ion-input color="light" v-model="mutableRecipe.description" />
            </ion-item>
        </ion-card-content>
    </ion-card>

    <template v-for="(step, stepIndex) in steps" :key="stepIndex">
        <ion-card>
            <ion-card-header>
                <ion-card-title color="primary">Schritt {{ stepIndex + 1}}</ion-card-title>
            </ion-card-header>

            <ion-card-content>
                <div>
                    <template v-for="(item, itemIndex) in step.items" :key="stepIndex + ' - ' + itemIndex">
                        <ion-thumbnail>
                            <!-- Add Item image -->
                            <img alt="Silhouette of mountains"
                                src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
                        </ion-thumbnail>
                        <ion-item>
                            <ion-label color="light">ID</ion-label>
                            <ion-input color="light" v-model="item.itemID" />
                        </ion-item>
                    </template>
                    <ion-button fill="clear" @click="addItem(stepIndex)">Add item</ion-button>
                </div>
                <ion-item>
                    <ion-label color="light">Description</ion-label>
                    <ion-input color="light" v-model="step.description" />
                </ion-item>
                <ion-button fill="clear" @click="addStep()">Add step</ion-button>
            </ion-card-content>
        </ion-card>
    </template>
</template>

<script lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonThumbnail, IonInput, IonItem, IonLabel, IonCardSubtitle } from '@ionic/vue';
import { computed, defineComponent, ref, toRefs } from 'vue';

export default defineComponent({
    name: 'RecipeEditor',
    props: {
        recipe: {
            type: Object,
            required: true,
        },
    },
    components: {
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        IonThumbnail,
        IonItem,
        IonLabel,
        IonInput,
        IonButton
    },
    setup(props) {
        const { recipe } = toRefs(props)

        const mutableRecipe = ref(recipe.value)
        const steps = computed(() => mutableRecipe.value.steps);

        const addStep = () => {
            steps.value.push({
                description: '',
                items: [],
            });
        };

        const addItem = (stepIndex: number) => {
            steps.value[stepIndex].items.push({
                itemID: '',
            });
        };

        return {
            mutableRecipe, steps,
            addStep, addItem
        };
    },
})
</script>