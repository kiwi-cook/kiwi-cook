<template>
    <IonGrid>
        <IonRow>
            <IonCol v-bind="$props">
                <slot name="left"></slot>
            </IonCol>
            <IonCol v-bind="$props">
                <slot name="right"></slot>
            </IonCol>
        </IonRow>
    </IonGrid>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonCol, IonGrid, IonRow} from "@ionic/vue";

export default defineComponent({
    name: 'TwoColumnLayout',
    components: {
        IonGrid, IonRow, IonCol
    }
});
</script>