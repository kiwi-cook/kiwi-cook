<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Today</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Tab 1</ion-title>
                </ion-toolbar>
            </ion-header>


            <ion-list lines="full">
                <ion-item>

                    <div class="container">
                        <div id="ContainerIMG">
                            <ion-img src="assets/food/food_hamburger.jpeg" alt="Hamburger Pic"></ion-img>
                            <div class="centered">Look at this beautyful Hamburger</div>
                        </div>
                    </div>
                </ion-item>
                <ion-item>
                    <div class="container">
                        <ion-button color="success">
                            <ion-icon slot="icon-only" :icon="heart"></ion-icon>
                            Anzahl Likes
                        </ion-button>
                        <ion-button color="success">
                            <ion-icon slot="icon-only" :icon="flagOutline">Save</ion-icon>
                            Gespeichert Icon wird ausgefüllt
                        </ion-button>
                        <ion-button color="success">
                            <ion-icon slot="icon-only" :icon="shareOutline"></ion-icon>
                            Share
                        </ion-button>
                    </div>
                </ion-item>
            </ion-list>

            <ion-list lines="inset">
                <ion-item>
                    <ion-label>Ingredients</ion-label>
                </ion-item>
            </ion-list>
            <div id=ContainerRoundIngredients>
                <div id="ContainerSingelRoundIngredients1">
                    <ion-avatar slot="start">
                        <img alt="Tomato" src="assets/ingredients/tomato.jpeg" />
                    </ion-avatar>
                </div>
                <div id="ContainerSingelRoundIngredients2">
                    <ion-avatar slot="start">
                        <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                    </ion-avatar>
                </div>
            </div>
            <ion-list>
                <ion-item>
                    <ion-label>Cooking Utensils</ion-label>
                </ion-item>
                <ion-avatar slot="start">
                    <img alt="pan" src="assets/cooking_utensils/pan.jpeg" />
                </ion-avatar>
                <ion-item>
                    <ion-label>Calories</ion-label>
                </ion-item>
            </ion-list>

        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonList, IonLabel } from '@ionic/vue';
import { heart, flagOutline, shareOutline } from 'ionicons/icons';

export default defineComponent({
    titel: 'Tab1Page',
    components: { IonHeader, IonIcon, IonButton, IonToolbar, IonTitle, IonContent, IonPage, IonItem, IonList, IonLabel },

    setup() {
        return {
            heart, flagOutline, shareOutline
        };
    },
});
</script>

<style scoped>
.container {
    position: relative;
    text-align: center;
    color: white;
    object-fit: fill;
    width: 100%;
    height: 100%;

}

#ContainerIMG {
    object-fit: fill;
    width: 100%;
    height: 100%;
    text-align: center;

}

#ContainerRoundIngredients {
    /* background-color: blue;
    */
}

#ContainerSingelRoundIngredients1 {
    /* background-color: red;*/
    flex: auto;
    display: flex;
    width: 100px;

}

#ContainerSingelRoundIngredients2 {
    /* background-color: pink;*/
    flex: auto;
    display: flex;
    width: 100px;
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
    background: rgba(255, 122, 89, 0.6)
}
</style>