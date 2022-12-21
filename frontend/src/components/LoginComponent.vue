<template>
    <ion-content class="ion-padding">
        <div id="ContainerBelow">
            <div id="ContainerIMG">
                <ion-img src="/assets/login.jpg" alt="Login You Must"></ion-img>
            </div>
            <div id="ContainerProfilText">
                <p>To discover all our Tastebud tickling recipes and features, please sign up!</p>
            </div>
            <div id="IonButtonProfil">
                <IonButton color="secondary" expand="block" fill="outline">Facebook</IonButton>
                <IonButton color="secondary" expand="block" fill="outline">E-Mail</IonButton>
            </div>
            <div id="LogIn">
                <p>Already have an account?</p><br>
                <a href="Login">Login in here</a>
            </div>
        </div>
    </ion-content>
</template>
  
<script lang="ts">
import { IonImg, IonButton, IonContent } from '@ionic/vue';
import { add, colorPalette, document, globe } from 'ionicons/icons';
import { defineComponent } from 'vue';

export default defineComponent({
    components: { IonImg, IonButton, IonContent },
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

#LogIn {

    padding: auto;
    margin: auto;
    text-align: center;
}

#LogIn a {
    color: deepskyblue;
}

#ContainerBelow {
    margin: auto;
    padding: auto;
    padding-bottom: 2%;
    /* background-color: aqua;*/

}

#ContainerProfilText p {
    font-size: 20px;
    color: deepskyblue;
    width: 75%;
    /*background-color: red;*/
    padding: auto;
    margin: auto;
    text-align: center;

}

#ContainerIMG {
    width: 20%;
    height: 20%;
    padding: auto;
    margin: auto;
    margin-bottom: 1%;
    text-align: center;
    /*background-color: blue;*/

}
</style>
