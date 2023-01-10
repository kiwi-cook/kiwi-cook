<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Today</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Detailed Recipe</ion-title>
                </ion-toolbar>
            </ion-header>


            <ion-list lines="full">
                <ion-item>
                    <div class="container">
                        <div class="ContainerIMG">
                            <ion-img src="assets/food/food_hamburger.jpeg" alt="Hamburger Pic"></ion-img>
                            <div class="centered">Look at this beautiful Hamburger</div>
                        </div>
                    </div>
                </ion-item>
                <ion-item>
                    <div class="container">
                        <div id="HeartSaveShareButton">
                            <ion-button color="primary" >
                                <ion-icon slot="icon-only" :icon="heart"></ion-icon>
                                Anzahl Likes
                            </ion-button>
                            <ion-button color="primary">
                                <ion-icon slot="icon-only" :icon="flagOutline">Save</ion-icon>
                                Gespeichert Icon wird ausgefüllt
                            </ion-button>
                            <ion-button color="primary">
                                <ion-icon slot="icon-only" :icon="shareOutline"></ion-icon>
                                Share
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
                                {{  ingredient.name }}
                            </ion-avatar>
                        </div>
                    </template>
                </div>
            </ion-list>
            <ion-list lines="inset">
                <ion-item color="primary">
                    <ion-label color="light">Cooking Utensils</ion-label>
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
import { computed, defineComponent, ref } from 'vue';
import { IonPage, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonList, IonLabel } from '@ionic/vue';
import { heart, flagOutline, shareOutline } from 'ionicons/icons';
import { getFromAPI } from '@/api';
import { API_ROUTE } from '@/api/constants';
import { Recipe, Item } from '@/api/types';

export default defineComponent({
    titel: 'Tab1Page',
    components: { IonHeader, IonIcon, IonButton, IonToolbar, IonTitle, IonContent, IonPage, IonItem, IonList, IonLabel },

    setup() {
        const recipes = ref<Recipe>();
        const items = ref<Item[]>();

        getFromAPI(API_ROUTE.RECIPES, (json: Recipe[]) => {
            recipes.value = json[0];
        });

        getFromAPI(API_ROUTE.ITEMS, (json: Item[]) => {
            items.value = json;
        });

        const itemsFromRecipe = computed(() => items.value?.filter(item => recipes.value?.steps.map((step) => step.items.map((stepItem) => stepItem.itemID).includes(item._id))));
        const ingredients = computed(() => itemsFromRecipe.value?.filter(item => item.type === 'Food'))
        const equipments = computed(() => itemsFromRecipe.value?.filter(item => item.type === 'Equipment'))


        return {
            ingredients, equipments,
            heart, recipes, flagOutline, shareOutline
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

.ContainerIMG {
    object-fit: fill;
    width: 100%;
    height: 100%;
    text-align: center;

}

/* Centered text */
.centered {
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