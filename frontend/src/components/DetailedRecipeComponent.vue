<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Recipe Of the Day</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Recipe Of the Day</ion-title>
                </ion-toolbar>
            </ion-header>


            <ion-list lines="full">
                <ion-item>
                    <div class="container">
                        <div class="container-img">
                            <ion-img :src="recipeOfTheDay?.imgUrl" :alt="`Image of ${recipeOfTheDay?.name}`"></ion-img>
                            <div class="container-img-text">{{ recipeOfTheDay?.description }}</div>
                        </div>
                    </div>
                </ion-item>
                <ion-item>
                    <div class="container">
                        <div id="HeartSaveShareButton">
                            <ion-button color="primary">
                                <ion-icon slot="icon-only" :icon="heart"></ion-icon>
                                3012 Likes
                            </ion-button>
                            <ion-button color="primary">
                                <ion-icon slot="icon-only" :icon="flagOutline">Save</ion-icon>
                                Save
                            </ion-button>
                            <ion-button color="primary">
                                <ion-icon slot="icon-only" :icon="shareOutline" aria-valuetext="Share Recipe"></ion-icon>
                            </ion-button>
                        </div>
                    </div>
                </ion-item>
            </ion-list>

            <ion-list lines="inset">
                <ion-item color="primary">
                    <ion-label color="light">Ingredients</ion-label>
                </ion-item>

                <div class="topic">
                    <template v-for="ingredient in ingredients" :key="ingredient">
                        <div class="element">
                            <ion-avatar slot="start">
                                <img :alt="ingredient.name" :src="'assets/ingredients/' + ingredient._id + '.jpeg'" />
                                {{ ingredient.name }}
                            </ion-avatar>
                        </div>
                    </template>
                </div>
            </ion-list>
            <ion-list lines="inset">
                <ion-item color="primary">
                    <ion-label color="light">Cooking utensils</ion-label>
                </ion-item>
                <div class="topic">
                    <template v-for="equipment in equipments" :key="equipment">
                        <div class="element">
                            <ion-avatar slot="start">
                                <img :alt="equipment.name" :src="'assets/ingredients/' + equipment.name + '.jpeg'" />
                                {{ equipment }}
                            </ion-avatar>
                        </div>
                    </template>
                </div>
            </ion-list>
            <ion-list lines="inset">
                <ion-item color="primary">
                    <ion-label color="light">Calories</ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue';
import { IonPage, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonList, IonLabel, IonAvatar, IonImg } from '@ionic/vue';
import { heart, flagOutline, shareOutline } from 'ionicons/icons';
import { Recipe, Item } from '@/api/types';
import { useTasteBuddyStore } from '@/storage';

export default defineComponent({
    titel: 'Tab1Page',
    components: { IonHeader, IonImg, IonIcon, IonButton, IonToolbar, IonTitle, IonContent, IonPage, IonItem, IonList, IonLabel, IonAvatar },

    setup() {
        const store = useTasteBuddyStore();
        const recipeOfTheDay: ComputedRef<Recipe> = computed(() => store.getters.getRecipes[0])
        const itemsFromRecipe: ComputedRef<Item[]> = computed(() => recipeOfTheDay.value?.steps.flatMap((step) => (step.items ?? []).map((stepItem) => stepItem.item)));
        const ingredients: ComputedRef<Item[]> = computed(() => itemsFromRecipe.value)
        const equipments: ComputedRef<Item[]> = computed(() => []);

        return {
            ingredients, equipments,
            recipeOfTheDay,
            heart, flagOutline, shareOutline
        };
    },
});
</script>

<style scoped>
.container {
    position: relative;
    text-align: center;
    color: lightgray;
    object-fit: fill;
    width: 100%;
    height: 100%;

}

.element {
    float: left;
    margin-bottom: 2%;
    margin-top: 2%;
    margin-right: 2%;
    margin-left: 2%;
    display: flex;
    flex: auto;
    grid-template-columns: repeat 1fr;
    /* background-color: red;*/
    padding: auto;
    text-align: center;
}

.topic {
    /*background-color: blue;*/
    text-align: center;
    color: lightgray;

}

#HeartSaveShareButton {
    margin-top: 2%;
}

.container-img {
    object-fit: fill;
    width: 100%;
    height: 100%;
    text-align: center;
}

.container-img-text {
    position: absolute;
    top: 95%;
    left: 50%;
    width: 100%;
    height: 15%;
    color: white;
    font-size: 20px;
    text-size-adjust: initial;
    transform: translate(-50%, -50%);
    background: rgba(255, 122, 0, 0.5)
}
</style>