<template>
    <ion-item lines="none">
        <ion-label color="primary" position="stacked">{{ label }}</ion-label>
        <slot></slot>
    </ion-item>
</template>

<script lang="ts">
import {IonItem, IonLabel} from '@ionic/vue';
import {defineComponent} from "vue";

export default defineComponent({
    name: 'AttributeEditor',
    props: {
        label: {
            type: String,
            required: true
        },
    },
    components: {
        IonItem, IonLabel
    }
})
</script>