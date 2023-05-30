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

                <ion-tab-button href="/recipe/finder" tab="recipe-finder">
                    <ion-icon :icon="sparklesOutline"/>
                    <ion-label>Suggestions</ion-label>
                </ion-tab-button>

                <ion-tab-button href="/recipe/saved" tab="saved-recipes">
                    <ion-icon :icon="heart"/>
                    <ion-label>Saved</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs,} from '@ionic/vue';
import {fastFood, heart, sparklesOutline} from 'ionicons/icons';

export default defineComponent({
    name: 'TabsPage',
    components: {IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet},
    setup() {

        return {
            heart,
            fastFood,
            sparklesOutline
        }
    }
});
</script>
