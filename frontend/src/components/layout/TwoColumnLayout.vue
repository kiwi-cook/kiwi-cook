<template>
    <IonGrid>
        <IonRow>
            <IonCol :size-lg="left" :size-md="left" :size-sm="left" :size-xl="left" size="12" v-bind="$props">
                <slot name="left"></slot>
            </IonCol>

            <IonCol v-if="$slots.right" :size-lg="right" :size-md="right" :size-sm="right" :size-xl="right" size="12"
                    v-bind="$props">
                <slot name="right"></slot>
            </IonCol>
        </IonRow>
    </IonGrid>
</template>

<script lang="ts">
import {computed, defineComponent, toRefs, useSlots} from 'vue';
import {IonCol, IonGrid, IonRow} from "@ionic/vue";

export default defineComponent({
    name: 'TwoColumnLayout',
    props: {
        layout: {
            type: String,
            required: false,
            default: "default"
        }
    },
    components: {
        IonGrid, IonRow, IonCol
    },
    setup(props: { layout: string }) {
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

        return {
            left: selectedLayout.value.left,
            right: selectedLayout.value.right
        }
    }
});
</script>