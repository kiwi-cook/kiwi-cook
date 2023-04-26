<template>
    <ion-page>
        <ion-tabs>
            <!-- Router views -->
            <ion-router-outlet/>

            <ion-tab-bar slot="bottom">
                <ion-tab-button href="/recipe/of-the-day" tab="recipe-of-the-day">
                    <ion-icon :icon="fastFood"/>
                    <ion-label>Today</ion-label>
                </ion-tab-button>

                <ion-tab-button href="/fridge" tab="fridge">
                    <ion-icon :icon="playCircle"/>
                    <ion-label>Fridge</ion-label>
                </ion-tab-button>

                <ion-tab-button href="/recipe" tab="recipe">
                    <ion-icon :icon="search"/>
                    <ion-label>Recipes</ion-label>
                </ion-tab-button>

                <ion-tab-button href="/shopping" tab="shopping">
                    <ion-icon :icon="cart"/>
                    <ion-label>Shopping</ion-label>
                </ion-tab-button>

                <ion-tab-button href="/user" tab="user">
                    <ion-icon :icon="person"/>
                    <ion-label>Profile</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs,} from '@ionic/vue';
import {cart, createOutline, ellipse, fastFood, person, playCircle, search, square, triangle} from 'ionicons/icons';

export default defineComponent({
    name: 'TabsPage',
    components: {IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet},
    setup() {

        return {
            ellipse,
            square,
            triangle,
            search,
            person,
            playCircle,
            cart,
            fastFood,
            createOutline
        }
    }
});
</script>
