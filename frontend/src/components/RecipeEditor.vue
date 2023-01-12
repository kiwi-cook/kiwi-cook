<template>
    <!-- Editor for recipes using cards -->
    <ion-card>
        <ion-img :alt="`Image of ${mutableRecipe.name}`"
            :src="`https://source.unsplash.com/random/700x400?${mutableRecipe.name}`" />
        <ion-card-header>
            <ion-card-title color="primary">
                <ion-item>
                    <ion-label color="light">Rezeptname</ion-label>
                    <ion-input color="light" v-model="mutableRecipe.name" />
                </ion-item>
            </ion-card-title>
            <ion-card-subtitle color="light">
                <ion-item>
                    <ion-label color="light">Author</ion-label>
                    <ion-input color="light" v-model="mutableRecipe.author" />
                </ion-item>
            </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content color="light">
            <ion-item>
                <ion-label color="light">Beschreibung</ion-label>
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
                        <ion-item>
                            <ion-thumbnail slot="start">
                                <!-- Add Item image -->
                                <img :alt="`Image of ${item.itemID}`"
                                    :src="`https://source.unsplash.com/random/50x50?${item.itemID}`" />
                            </ion-thumbnail>
                            <ion-label color="light">Item</ion-label>
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
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonThumbnail, IonInput, IonItem, IonLabel, IonCardSubtitle, IonImg } from '@ionic/vue';
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
        IonImg,
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