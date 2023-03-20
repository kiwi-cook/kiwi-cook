<template>
    <ion-page>
        <ion-tabs>
            <!-- Router views -->
            <ion-router-outlet />

            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="tab1" href="/start">
                    <ion-icon :icon="fastFood" />
                    <ion-label>Today</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="tab2" href="/fridge">
                    <ion-icon :icon="playCircle" />
                    <ion-label>Fridge</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="tab3" href="/search">
                    <ion-icon :icon="search" />
                    <ion-label>Search</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="tab4" href="/shopping">
                    <ion-icon :icon="cart" />
                    <ion-label>Shopping</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="tab5" href="/login">
                    <ion-icon :icon="person" />
                    <ion-label>Profil</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="editor" href="/editor">
                    <ion-icon :icon="createOutline" />
                    <ion-label>Editor</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet, } from '@ionic/vue';
import { ellipse, square, triangle, search, person, playCircle, cart, fastFood, createOutline } from 'ionicons/icons';

export default defineComponent({
    name: 'TabsPage',
    components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet },
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
