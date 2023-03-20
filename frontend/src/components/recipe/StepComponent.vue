<template>
    <ion-card>
        <ion-img :src="step?.imgUrl"/>
        <ion-card-header>
            <ion-card-title color="light">
                Step {{ stepIndex + 1 }}
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <SmallItemContainer :items="step?.items"/>
            <ion-item lines="none">
                <ion-text color="light">
                    {{ step.description }}
                </ion-text>
            </ion-item>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {IonCard, IonCardContent, IonCardHeader, IonImg, IonItem, IonText} from '@ionic/vue';
import {defineComponent, PropType} from "vue";
import {Step} from "@/api/types";
import SmallItemContainer from "@/components/item/SmallItemContainer.vue";

export default defineComponent({
    name: 'RecipeStep',
    props: {
        stepIndex: {
            type: Number,
            required: true
        },
        step: {
            type: Object as PropType<Step>,
            required: true
        }
    },
    components: {
        SmallItemContainer,
        IonCard, IonCardHeader, IonCardContent, IonItem, IonText, IonImg
    },
    setup() {
        return {}
    }
})
</script>