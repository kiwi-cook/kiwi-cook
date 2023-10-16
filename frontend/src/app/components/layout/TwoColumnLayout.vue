<template>
    <IonGrid>
        <IonRow>
            <IonCol :size-lg="selectedLayout.left.lg"
                    :size-md="selectedLayout.left.md"
                    :size-xl="selectedLayout.left.xl"
                    class="left"
                    size="12"
                    size-sm="12"
                    v-bind="$props">
                <slot name="left"/>
            </IonCol>

            <IonCol v-if="$slots.right" :size-lg="selectedLayout.right.lg"
                    :size-md="selectedLayout.right.md"
                    :size-xl="selectedLayout.right.xl"
                    class="right"
                    size="12"
                    size-sm="12"
                    v-bind="$props">
                <slot name="right"/>
            </IonCol>
        </IonRow>
    </IonGrid>
</template>

<script lang="ts" setup>
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
    left: {
        xl: string,
        lg: string,
        md: string
    },
    right: {
        xl: string,
        lg: string,
        md: string
    }
}

const layouts: { [key: string]: Layout } = {
    default: {
        left: {
            xl: "6",
            lg: "6",
            md: "12"
        },
        right: {
            xl: "6",
            lg: "6",
            md: "12"
        }
    },
    leftBigger: {
        left: {
            xl: "8",
            lg: "8",
            md: "7"
        },
        right: {
            xl: "4",
            lg: "4",
            md: "5"
        }
    },
    rightBigger: {
        left: {
            xl: "4",
            lg: "4",
            md: "5"
        },
        right: {
            xl: "8",
            lg: "8",
            md: "7"
        }
    },
    noRight: {
        left: {
            xl: "12",
            lg: "12",
            md: "12"
        },
        right: {
            xl: "0",
            lg: "0",
            md: "0"
        }
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
</style>