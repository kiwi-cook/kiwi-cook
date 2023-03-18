<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Recipe of the Day</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="gradient">
                <div class="content">
                    <ion-header collapse="condense">
                        <ion-toolbar>
                            <ion-title size="large">Recipe of the Day</ion-title>
                        </ion-toolbar>
                    </ion-header>
                    <DetailedRecipeComponent />
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';
import DetailedRecipeComponent from '@/components/DetailedRecipeComponent.vue';


export default defineComponent({
    title: 'RecipeOfTheDayPage',
    components: {
        DetailedRecipeComponent,
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle
    }
});
</script>

<style scoped>
.gradient {
    background: linear-gradient(to bottom, #2F3540 0%, rgba(0,0,0,0) 100%);
}
</style>