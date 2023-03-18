<template>
    <ion-page>
        <ion-page>
            <ion-header>
                <ion-toolbar color="primary">
                    <ion-title color="light">Fridge</ion-title>
                </ion-toolbar>
                <ion-toolbar color="primary">
                    <ion-searchbar color="secondary" :debounce="100" v-model="filterInput" />
                </ion-toolbar>
            </ion-header>

            <ion-content>
                <div class="content">
                    <FridgeComponent :filter="filterInput" />
                </div>
            </ion-content>
        </ion-page>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { IonTitle, IonSearchbar, IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/vue';
import FridgeComponent from '@/components/FridgeComponent.vue';


export default defineComponent({
    title: 'FridgePage',
    components: {
        FridgeComponent,
        IonTitle, IonSearchbar, IonContent, IonHeader, IonPage, IonToolbar
    },
    setup() {
        const filterInput = ref('')

        return {
            filterInput
        }
    }
});
</script>
