<template>
    <ion-button color="tertiary" @click="toRecipe()">
        <slot />
    </ion-button>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from "vue";
import { Recipe } from "@/tastebuddy/types";
import { IonButton, useIonRouter } from "@ionic/vue";

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
        const { recipe } = toRefs(props);
        const router = useIonRouter();
        const toRecipe = () => {
            router.push({ name: 'Recipe', params: { id: recipe.value?.getId() } })
        }

        return {
            toRecipe
        }
    }
})
</script>