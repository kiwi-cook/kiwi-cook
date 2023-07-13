<template>
    <IonGrid>
        <IonRow>
            <IonCol :size="left" v-bind="$props">
                <slot name="left"></slot>
            </IonCol>
            <IonCol :size="right" v-bind="$props">
                <slot name="right"></slot>
            </IonCol>
        </IonRow>
    </IonGrid>
</template>

<script lang="ts">
import {computed, defineComponent, toRefs} from 'vue';
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
            }
        }

        const selectedLayout = computed(() => layouts[layout.value])

        return {
            left: selectedLayout.value.left,
            right: selectedLayout.value.right
        }
    }
});
</script>