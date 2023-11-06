<template>
    <div class="mini-recipe-preview-container" @click="routeToRecipe()">
        <img :alt="`Preview Image of ${name}`" :src="imgUrl" class="mini-recipe-preview-image"/>
        <div class="mini-recipe-tags">
            <Duration :duration="duration" class="mini-recipe-tag"/>
        </div>
        <h3 class="mini-recipe-preview-title">{{ name }}</h3>
    </div>
</template>

<script lang="ts" setup>
import {toRefs} from 'vue';
import {useIonRouter} from '@ionic/vue';
import Duration from '@/shared/components/recipe/chip/Duration.vue';

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: false,
        default: undefined
    },
    duration: {
        type: Number,
        required: false,
        default: undefined
    },
    link: {
        type: String,
        required: false,
        default: undefined
    },
})

const {link} = toRefs(props)
const router = useIonRouter();
const routeToRecipe = () => router.push(link?.value)
</script>

<style>
:root {
    --mini-recipe-width: 220px;
    --mini-recipe-height: 150px;
}

@media (width <= 1280px) {
    :root {
        --mini-recipe-width: 170px;
    }
}

@media (width <= 768px) {
    :root {
        --mini-recipe-width: 150px;
    }
}

.mini-recipe-preview-container {
    width: var(--mini-recipe-width); /* Set a maximum width for the preview */
    margin: 0 var(--margin) 0 auto;
    cursor: pointer;
}

.mini-recipe-preview-image {
    width: var(--mini-recipe-width); /* Set a fixed width */
    height: var(--mini-recipe-height); /* Set a fixed height */
    object-fit: cover; /* Crop the image if necessary */
    border-radius: 8px; /* Optional: Add rounded corners */
    border: var(--border);
    transition: var(--transition);
}

.mini-recipe-preview-image:hover {
    box-shadow: var(--box-shadow-hover) !important;
    transform: scale(1.02, 1.02);
}

.mini-recipe-preview-title {
    /* font */
    font-size: var(--font-size-smaller);
    font-weight: var(--font-weight-light);
    color: var(--ion-color-medium);

    /* sizing */
    margin-top: var(--margin-small);
    width: 100%;
    box-sizing: border-box;
}

.mini-recipe-preview-tag {
    font-size: var(--font-size-small);
}
</style>