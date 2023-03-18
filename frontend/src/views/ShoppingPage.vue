<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Shopping</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-toolbar color="primary">
            <ion-searchbar color="secondary" :debounce="100" v-model="filterInput" />
        </ion-toolbar>
        <div id="filter-relevanz-button">
            <ion-button color="primary">
                <ion-label color="light">
                    Filter
                </ion-label>
            </ion-button>
            <ion-button color="primary">
                <ion-icon color="light" slot="icon-only" :icon="arrowDown"></ion-icon>
                <ion-label color="light">
                    Relevanz
                </ion-label>
            </ion-button>
        </div>

        <ion-content>
            <div class="content">
                <ShoppingComponent :filter="filterInput" />
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { IonButton, IonHeader, IonIcon, IonLabel, IonPage, IonSearchbar, IonTitle, IonToolbar, IonContent } from '@ionic/vue';
import ShoppingComponent from '@/components/ShoppingComponent.vue';
import { arrowDown } from 'ionicons/icons';

export default defineComponent({
    name: 'DiscountsPage',
    components: {
        ShoppingComponent,
        IonPage, IonHeader, IonToolbar, IonTitle, IonSearchbar, IonButton, IonLabel, IonIcon, IonContent
    },
    setup() {
        const filterInput = ref('')

        return {
            filterInput,
            arrowDown
        }
    }
});
</script>
