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
                    </div>
                </ion-item>
            </ion-list>

            <ion-list lines="inset">
                <ion-item color="success">
                    <ion-label>Ingredients</ion-label>
                </ion-item>

                <div id="topic">
                    <div class="element">
                        <ion-avatar slot="start">
                            <img alt="Tomato" src="assets/ingredients/tomato.jpeg" />
                            Tomato
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar>
                            <img alt="Corn" src="assets/ingredients/corn.jpeg" />
                            Mais
                        </ion-avatar>
                    </div>
                </div>
            </ion-list>
            <ion-list lines="inset">
                <ion-item color="success">
                    <ion-label>Cooking Utensils</ion-label>
                </ion-item>
                <div class="topic">
                    <div class="element">
                        <ion-avatar slot="start">
                            <img alt="pan" src="assets/cooking_utensils/pan.jpeg" />
                            Pan
                        </ion-avatar>
                    </div>
                    <div class="element">
                        <ion-avatar slot="start">
                            <img alt="pan" src="assets/cooking_utensils/pan.jpeg" />
                            Pan
                        </ion-avatar>
                    </div>
                </div>
            </ion-list>
            <ion-list lines="inset">
                <ion-item color="success">
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
    background: rgba(255, 122, 89, 0.6)
}
</style>