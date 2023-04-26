<template>
    <ion-img :style="{ width: logoWidth, height: logoHeight }" class="logo" src="./assets/logo/logo.png"/>
</template>

<script lang="ts">
import {IonImg} from '@ionic/vue'

export default {
    name: 'TasteBuddyLogo',
    props: {
        logoWidth: {
            type: String,
            default: '200px'
        },
        logoHeight: {
            type: String,
            default: '200px'
        }
    },
    components: {
        IonImg
    }
}
</script>

<style>
.logo {
    display: block;
    margin: 0 auto;
}

/* shadow root styles */
.logo::part(image) {
    border-radius: 50px;
}
</style>