<template>
    <IonGrid>
        <IonRow>
            <IonCol
                :size-sm="selectedLayout.left"
                :size-md="selectedLayout.left"
                :size-lg="selectedLayout.left"
                :size-xl="selectedLayout.left"
                size="12"
                v-bind="$props">
                <slot name="left"></slot>
            </IonCol>

            <IonCol v-if="$slots.right"
                    :size-sm="selectedLayout.right"
                    :size-md="selectedLayout.right"
                    :size-lg="selectedLayout.right"
                    :size-xl="selectedLayout.right"
                    size="12"
                    v-bind="$props">
                <slot name="right"></slot>
            </IonCol>
        </IonRow>
    </IonGrid>
</template>

<script setup lang="ts">
import {computed, toRefs, useSlots} from 'vue';
import {IonCol, IonGrid, IonRow} from "@ionic/vue";

const props = defineProps({
    layout: {
        type: String,
        required: false,
        default: "default"
    }
})
const {layout} = toRefs(props)

const slots = useSlots()
const hasRightSlot = computed(() => !!slots['right'])

const layouts: { [key: string]: { left: string, right: string } } = {
    default: {
        left: "",
        right: ""
    },
    leftBigger: {
        left: "8",
        right: "4"
    },
    rightBigger: {
        left: "4",
        right: "8"
    },
    noRight: {
        left: "12",
        right: ""
    }
}

const selectedLayout = computed(() => hasRightSlot.value ? layouts[layout.value] : layouts["noRight"])
</script>