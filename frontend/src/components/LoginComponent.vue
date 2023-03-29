<template>
    <ion-card>
        <ion-row>
            <ion-col size-md="9" size="12" class="welcome">
                <ion-card-header>
                    <ion-card-title color="success">Welcome!</ion-card-title>
                </ion-card-header>
                <ion-card-content color="success">
                    <ion-label>New to Taste Buddy?</ion-label>
                    <ion-button shape="round" color="primary">Create an account</ion-button>
                </ion-card-content>
            </ion-col>

            <ion-col size-md="9" size="12" class="welcome">
                <ion-card-header>
                    <ion-card-title color="success">Already have an account?</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ion-label>Then please</ion-label>
                    <ion-button shape="round" color="primary">Sign in</ion-button>
                </ion-card-content>
            </ion-col>
        </ion-row>
    </ion-card>
</template>

<script lang="ts">
import { IonCard, IonLabel, IonCardTitle, IonCardContent, IonCardHeader, IonRow, IonCol, IonButton } from '@ionic/vue';
import { add, colorPalette, document, globe } from 'ionicons/icons';
import { defineComponent } from 'vue';


export default defineComponent({
    name: "LoginComponent",
    components: { IonCardContent, IonLabel, IonCardTitle, IonCardHeader, IonCard, IonRow, IonCol, IonButton },
    setup() {
        return { add, colorPalette, document, globe }
    }
});
</script>

<style scoped>
ion-button {
    --color: red;
    --padding-top: 20px;
    --padding-bottom: 20px;
    margin: 2%;

}

.container-profile-text p {
    font-size: 20px;
    color: deepskyblue;
    width: 75%;
    margin: auto;
    text-align: center;
}
</style>
