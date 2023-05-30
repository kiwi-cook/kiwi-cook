<template>
    <ion-page id="recipe-list-page">
        <ion-header>
            <ion-toolbar color="primary">
                <TasteBuddyLogo size="tiny" with-left-margin slot="start"/>
                <ion-title>Recipes</ion-title>
            </ion-toolbar>
            <ion-toolbar color="primary">
                <ion-searchbar v-model="filterInput" :debounce="500" color="secondary"/>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="content">
                <RecipeList :filter="filterInput"/>
            </div>
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
    IonToolbar
} from '@ionic/vue';
import RecipeList from '@/components/recipe/RecipeList.vue'
import {arrowDown, filter} from 'ionicons/icons';
import TasteBuddyLogo from "@/components/general/TasteBuddyLogo.vue";

export default defineComponent({
    name: 'RecipesOverviewPage',
    components: {
        TasteBuddyLogo,
        IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar, IonContent,
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