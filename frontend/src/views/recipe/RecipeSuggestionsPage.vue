<template>
    <ion-page id="recipe-list-page">
        <ion-header>
            <ion-toolbar color="primary">
                <TasteBuddyLogo size="tiny" with-left-margin slot="start"/>
                <ion-title>Suggestions</ion-title>
            </ion-toolbar>
            <ion-toolbar color="primary">
                <ion-searchbar v-model="filterInput" :debounce="500" color="secondary"/>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-img :src="dogImageLink" alt="dog" style="width: 80%; height: 80%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: -1;"/>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    IonImg,
} from '@ionic/vue';
import {filter} from 'ionicons/icons';
import TasteBuddyLogo from "@/components/general/TasteBuddyLogo.vue";

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        TasteBuddyLogo,
        IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar, IonContent, IonImg
    },
    setup() {
        const filterInput = ref('')
        const dogImageLink = ref('')
        fetch('https://dog.ceo/api/breeds/image/random').then(res => res.json()).then(res => {
            dogImageLink.value = res.message
        })

        return {
            dogImageLink,
            // filter
            filterInput, filter
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