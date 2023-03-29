<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>Search Recipes</ion-title>
            </ion-toolbar>
            <ion-toolbar color="primary">
                <ion-searchbar color="secondary" :debounce="100" v-model="filterInput" />
            </ion-toolbar>
            <ion-toolbar color="primary">
                <div class="filter-relevanz-button">
                    <ion-button color="primary">
                        <ion-icon slot="icon-only" :icon="filter"></ion-icon>
                        <ion-label>
                            Filter
                        </ion-label>
                    </ion-button>
                    <ion-button color="primary">
                        <ion-icon slot="icon-only" :icon="arrowDown"></ion-icon>
                        <ion-label>
                            Relevanz
                        </ion-label>
                    </ion-button>
                </div>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="content">
                <ion-header collapse="condense">
                    <ion-toolbar>
                        <ion-title size="large">Search Recipes</ion-title>
                    </ion-toolbar>
                </ion-header>


                <RecipeList :filter="filterInput" />
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import RecipeList from '@/components/recipe/RecipeList.vue'
import { arrowDown, filter } from 'ionicons/icons';

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        IonButton, IonHeader, IonIcon, IonLabel, IonPage, IonSearchbar, IonTitle, IonToolbar, IonContent,
        RecipeList
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