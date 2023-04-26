<template>
    <ion-button :router-link="recipeLink">
        <slot></slot>
    </ion-button>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Recipe} from "@/api/types";
import {IonButton} from "@ionic/vue";

export default defineComponent({
    name: 'RecipeLink',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true
        }
    },
    components: {
        IonButton
    },
    setup(props: any) {
        const {recipe} = toRefs(props);
        const recipeLink = computed(() => `/recipe/${recipe.value?._id ?? ''}`)

        return {
            recipeLink
        }
    }
})
</script>