<template>
    <div class="preview-container" @click="routeToRecipe()">
        <img class="preview-image" :src="recipe?.props?.imgUrl" :alt="`Preview Image of ${name}`">
        <h3 class="preview-title">{{ name }}</h3>
        <h4 class="preview-subtitle">
            <IonChip v-if="duration ?? 0 > 0">
                <IonIcon :icon="time"/>
                <IonLabel>{{ duration }} min.</IonLabel>
            </IonChip>
        </h4>
    </div>
</template>

<script setup lang="ts">
import {computed, PropType, toRefs} from "vue";
import {Recipe} from "@/tastebuddy";
import {IonChip, IonIcon, IonLabel, useIonRouter} from "@ionic/vue";
import {time} from "ionicons/icons";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true
    }
})

const {recipe} = toRefs(props)
const router = useIonRouter();
const routeToRecipe = () => router.push(recipe?.value?.getRoute())
const name = computed(() => recipe?.value?.getName())
const duration = computed(() => recipe?.value?.getDuration())
</script>

<style scoped>
.preview-container {
    width: 150px; /* Set a maximum width for the preview */
    margin: 0 var(--margin) 0 auto;
    cursor: pointer;
}

.preview-image {
    width: 150px; /* Set a fixed width */
    height: 150px; /* Set a fixed height */
    object-fit: cover; /* Crop the image if necessary */
    border-radius: 8px; /* Optional: Add rounded corners */
    border: var(--border);
    transition: var(--transition);
}

.preview-image:hover {
    box-shadow: var(--box-shadow-hover) !important;
    transform: scale(1.02, 1.02);
}

.preview-title {
    /* font */
    font-size: var(--font-size-smaller);
    font-weight: var(--font-weight-light);
    color: var(--ion-color-medium);

    /* sizing */
    margin-top: var(--margin-small);
    width: 100%;
    box-sizing: border-box;
}

.preview-subtitle {
    font-size: var(--font-size-tiny);
    font-weight: var(--font-weight-light);

}
</style>