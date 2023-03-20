<template>
    <div class="hero">
        <ion-img :alt="`Image of ${recipe?.name}`" :src="recipe?.imgUrl" class="hero-image"/>
        <div class="hero-text">
            <h1>{{ recipe?.name }}</h1>
            <p>{{ recipe?.description }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import {Recipe} from "@/api/types";
import {IonImg} from "@ionic/vue";

export default defineComponent({
    name: 'RecipeHero',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true
        }
    },
    components: {
        IonImg
    }
})
</script>

<style>
.hero {
    position: relative;
    height: 500px;
    width: 100%;
    overflow: hidden;
    border-radius: 10px;
}

.hero-image::part(image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
}

.hero-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 70%, rgba(0, 0, 0, 0) 100%);
    color: #fff;
    text-align: center;
    display: flex;
    /* add display flex */
    flex-direction: column;
    /* add flex direction column */
    justify-content: center;
    /* add justify content center */
    height: 50%;
    /* set height to 50% */
}

.hero-text h1 {
    font-size: 3em;
    font-weight: bold;
    margin: 0 0 10px;
}

.hero-text p {
    font-size: 1.5em;
    /* reduce font size for longer text */
    margin: 0;
}

@media only screen and (max-width: 768px) {

    .hero {
        height: 300px;
    }

    ion-img.hero-image::part(image) {
        object-fit: cover;
        object-position: center;
    }

    .hero-text {
        height: auto;
        padding: 10px;
    }

    .hero-text h1 {
        font-size: 2em;
    }

    .hero-text p {
        font-size: 1em;
    }
}

@media only screen and (max-width: 480px) {

    .hero {
        height: 200px;
    }

    ion-img.hero-image::part(image) {
        object-fit: cover;
        object-position: center;
    }

    .hero-text {
        height: auto;
        padding: 10px;
    }

    .hero-text h1 {
        font-size: 1.5em;
    }

    .hero-text p {
        font-size: 1em;
    }
}
</style>