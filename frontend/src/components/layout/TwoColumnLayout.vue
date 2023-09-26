<template>
    <IonGrid>
        <IonRow>
            <IonCol class="left"
                    :size-xl="selectedLayout.left"
                    :size-lg="selectedLayout.left"
                    size-md="6"
                    size-sm="12"
                    size="12"
                    v-bind="$props">
                <slot name="left"></slot>
            </IonCol>

            <IonCol v-if="$slots.right" class="right"
                    :size-xl="selectedLayout.right"
                    :size-lg="selectedLayout.right"
                    size-md="6"
                    size-sm="12"
                    size="12"
                    v-bind="$props">
                <slot name="right"></slot>
            </IonCol>
        </IonRow>
    </IonGrid>
</template>

<script setup lang="ts">
import {computed, PropType, toRefs, useSlots} from 'vue';
import {IonCol, IonGrid, IonRow} from "@ionic/vue";

const props = defineProps({
    layout: {
        type: String as PropType<"default" | "leftBigger" | "rightBigger" | "noRight">,
        required: false,
        default: "default"
    }
})
const {layout} = toRefs(props)

const slots = useSlots()
const hasRightSlot = computed(() => !!slots['right'])

type Layout = {
    left: string,
    right: string
}

const layouts: { [key: string]: Layout } = {
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
        right: "0"
    }
}

const selectedLayout = computed(() => hasRightSlot.value ? layouts[layout.value] : layouts["noRight"])
</script>

<style>
.left {
    padding-right: 1rem;
}

.right {
    padding-left: 1rem;
}

@media (max-width <= 767px) {
    .left {
        padding-right: 0;
    }

    .right {
        padding-left: 0;
    }
}
</style>