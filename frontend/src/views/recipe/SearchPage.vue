<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Search Recipes</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-toolbar color="primary">
            <ion-searchbar color="secondary" :debounce="100" v-model="filterInput" />
        </ion-toolbar>

        <ion-content>
            <div class="content">
                <div class="filter-relevanz-button">
                    <ion-button color="primary">
                        <ion-icon color="light" slot="icon-only" :icon="filter"></ion-icon>
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

                <SearchComponent :filter="filterInput"></SearchComponent>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { IonButton, IonHeader, IonIcon, IonLabel, IonPage, IonSearchbar, IonTitle, IonToolbar, IonContent } from '@ionic/vue';
import SearchComponent from '@/components/SearchComponent.vue'
import { arrowDown, filter } from 'ionicons/icons';

export default defineComponent({
    name: 'SearchPage',
    components: {
        IonButton, IonHeader, IonIcon, IonLabel, IonPage, IonSearchbar, IonTitle, IonToolbar, IonContent,
        SearchComponent
    },
    setup() {
        const filterInput = ref('')

        return {
            arrowDown, filter,
            filterInput
        }
    }
});
</script>

<style scoped>
.filter-relevanz-button {
    margin: 2%;
    color: white;
}
</style>