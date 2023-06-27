<template>
    <IonPage>
        <IonRouterOutlet/>
    </IonPage>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonPage, IonRouterOutlet} from '@ionic/vue';

export default defineComponent({
    title: 'RecipePage',
    components: {IonRouterOutlet, IonPage}
});

</script>