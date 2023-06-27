<template>
    <div class="recipe-hero">
        <ion-img :alt="`Image of ${recipe?.name}`" :src="recipe?.props?.imgUrl ?? ''" class="hero-image" />
        <div class="hero-content">
            <div class="hero-text">
                <h1 class="recipe-name">{{ recipe?.name }}</h1>
                <p class="recipe-description">{{ recipe?.getShortDescription() }}</p>
                <h2 class="recipe-author">By {{ recipe?.author }}</h2>
            </div>
            <div class="hero-tags">
                <div v-if="(recipe?.props?.tags ?? []).length > 0" class="flex">
                    <ion-chip v-for="tag in recipe?.props.tags" :key="tag" class="hero-tag" color="light">
                        <ion-label>{{ tag }}</ion-label>
                    </ion-chip>
                </div>
                <div class="flex">
                    <ion-chip color="light" class="hero-tag">
                        <ion-label>{{ recipe?.getDuration() }} minutes</ion-label>
                    </ion-chip>
                    <!-- <ion-chip color="light" class="hero-tag recipe-created-date">
                        created on {{ formatDate(recipe?.props.createdAt) }}
                    </ion-chip> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Recipe } from "@/tastebuddy/types";
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
.recipe-hero {
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

.hero-text h1.recipe-name {
    font-size: 3em;
    font-weight: bold;
    margin: 0 0 10px;
}

.hero-text h2.recipe-author {
    font-size: 2em;
    font-weight: bold;
}

.hero-text p.recipe-description {
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

    .recipe-hero {
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

    .hero-text h1.recipe-name {
        font-size: 2em;
    }

    .hero-text h2.recipe-author {
        font-size: 1.5em;
        font-weight: bold;
    }

    .hero-text p.recipe-description {
        font-size: 1em;
    }
}

@media only screen and (max-width: 480px) {

    .recipe-hero {
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

    .hero-text p.recipe-description {
        display: none;
    }

    .hero-text h2.recipe-author {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 1em;
        font-weight: bold;
    }


    .hero-tags {
        margin-top: 0;
    }

    .recipe-created-date {
        display: none;
    }
}
</style>