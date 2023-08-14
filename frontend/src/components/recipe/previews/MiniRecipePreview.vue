<template>
    <IonCard class="mini-recipe-card" @click="routeToRecipe()">
        <IonImg :src="recipe?.props.imgUrl"></IonImg>
        <IonCardHeader>
            <IonCardSubtitle>{{ recipe?.getDuration() }} min.</IonCardSubtitle>
            <IonCardTitle class="mini-recipe-card-title">{{ recipe?.name }}</IonCardTitle>
        </IonCardHeader>
    </IonCard>
</template>

<script lang="ts">
import {defineComponent, PropType, toRefs} from "vue";
import {Recipe} from "@/tastebuddy";
import {IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonImg, useIonRouter} from "@ionic/vue";

export default defineComponent({
    name: 'MiniRecipePreview',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true
        }
    },
    components: {
        IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonImg
    },
    setup(props: { recipe: Recipe }) {
        const {recipe} = toRefs(props)
        const router = useIonRouter();
        const routeToRecipe = () => router.push(recipe.value.getRoute())
        return {
            routeToRecipe
        }
    }
})
</script>

<style scoped>
.mini-recipe-card {
    width: 200px;
    cursor: pointer;
    box-shadow: var(--box-shadow) !important;
}

.mini-recipe-card-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 5px;
}
</style>