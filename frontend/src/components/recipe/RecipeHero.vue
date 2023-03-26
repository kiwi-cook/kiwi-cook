<template>
    <div class="hero">
        <ion-img :alt="`Image of ${recipe?.name}`" :src="recipe?.imgUrl" class="hero-image" />
        <div class="hero-content">
            <div class="hero-text">
                <h1>{{ recipe?.name }}</h1>
                <p>{{ recipe?.description }}</p>
                <h2>{{ recipe?.author }}</h2>
            </div>
            <div class="hero-tags">
                <div class="flex">
                    <ion-chip v-for="tag in recipe?.tags" :key="tag" class="hero-tag" color="light">
                        <ion-label>{{ tag }}</ion-label>
                    </ion-chip>
                </div>
                <div class="flex">
                    <ion-chip color="light">
                        <ion-label>{{ recipe?.cookingTime }} min preparation time</ion-label>
                    </ion-chip>
                    <ion-chip color="light">
                        {{ formatDate(recipe?.createdAt) }}
                    </ion-chip>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Recipe } from "@/api/types";
import { IonChip, IonImg, IonLabel } from "@ionic/vue";
import { formatDate } from "@/utility/util";

export default defineComponent({
    name: 'RecipeHero',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true
        }
    },
    components: {
        IonImg, IonChip, IonLabel
    },
    setup() {
        return {
            formatDate
        }
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

.hero-content {
    left: 0;
    right: 0;
    bottom: 0;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    min-height: 250px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 70%, rgba(0, 0, 0, 0) 100%);
}

.hero-text {
    padding: 30px;
    color: #fff;
    text-align: center;
    display: flex;
    /* add display flex */
    flex-direction: column;
    /* add flex direction column */
    justify-content: center;
}

.hero-text h1 {
    font-size: 3em;
    font-weight: bold;
    margin: 0 0 10px;
}

.hero-text p {
    font-size: 1.5em;
    margin: 0;
}

.hero-tags {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 15px;
}

.hero-tag {
    margin: 0 10px 0 0;
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