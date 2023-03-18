<template>
    <ion-list lines="none">
        <ion-item>
            <div class="container hero">
                <div class="hero-image">
                    <ion-img :src="recipeOfTheDay?.imgUrl" :alt="`Image of ${recipeOfTheDay?.name}`" />
                </div>
                <div class="hero-text">
                    <h1>{{ recipeOfTheDay?.name }}</h1>
                    <p>{{ recipeOfTheDay?.description }}</p>
                </div>
            </div>
        </ion-item>
        <ion-item>
            <div class="container">
                <div id="HeartSaveShareButton">
                    <ion-button color="primary">
                        <ion-icon slot="icon-only" :icon="heart"></ion-icon>
                        3012 Likes
                    </ion-button>
                    <ion-button color="primary">
                        <ion-icon slot="icon-only" :icon="flagOutline">Save</ion-icon>
                        Save
                    </ion-button>
                    <ion-button color="primary">
                        <ion-icon slot="icon-only" :icon="shareOutline" aria-valuetext="Share Recipe"></ion-icon>
                    </ion-button>
                </div>
            </div>
        </ion-item>
    </ion-list>

    <ion-list lines="inset" v-if="ingredients?.length > 0">
        <ion-item color="primary">
            <ion-label color="light" class="topic">Ingredients</ion-label>
        </ion-item>

        <div class="topic-contents">
            <SmallItemContainer :items="ingredients" />
        </div>
    </ion-list>
    <ion-list lines="inset" v-if="equipments?.length > 0">
        <ion-item color="primary">
            <ion-label color="light" class="topic">Cooking utensils</ion-label>
        </ion-item>
        <div class="topic-content">
            <SmallItemContainer :items="equipments" />
        </div>
    </ion-list>
    <ion-list lines="inset" v-if="false">
        <ion-item color="primary">
            <ion-label color="light" class="topic">Calories</ion-label>
        </ion-item>
        <div class="topic-content">
            <!-- -->
        </div>
    </ion-list>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue';
import { IonImg, IonButton, IonIcon, IonItem, IonList, IonLabel } from '@ionic/vue';
import { heart, flagOutline, shareOutline } from 'ionicons/icons';
import { Recipe, Item } from '@/api/types';
import { useTasteBuddyStore } from '@/storage';
import SmallItemContainer from './item/SmallItemContainer.vue';

export default defineComponent({
    title: 'DetailedRecipePage',
    components: {
        SmallItemContainer,
        IonImg, IonIcon, IonButton, IonItem, IonList, IonLabel,
    },
    setup() {
        const store = useTasteBuddyStore();
        const recipeOfTheDay: ComputedRef<Recipe> = computed(() => store.getters.getRecipes[0])
        const itemsFromRecipe: ComputedRef<Item[]> = computed(() => recipeOfTheDay.value?.getItems());
        const ingredients: ComputedRef<Item[]> = computed(() => itemsFromRecipe.value)
        const equipments: ComputedRef<Item[]> = computed(() => []);

        return {
            ingredients, equipments,
            recipeOfTheDay,
            heart, flagOutline, shareOutline
        };
    },
});
</script>

<style scoped>
.container {
    position: relative;
    text-align: center;
    color: lightgray;
    object-fit: fill;
    width: 100%;
    height: 100%;
}

.element {
    float: left;
    margin-bottom: 2%;
    margin-top: 2%;
    margin-right: 2%;
    margin-left: 2%;
    display: flex;
    flex: auto;
    grid-template-columns: repeat 1fr;
    /* background-color: red;*/
    padding: auto;
    text-align: center;
}

/* Topic */
.topic {
    font-weight: bold;
}

.topic-content {
    /*background-color: blue;*/
    text-align: center;
}

#HeartSaveShareButton {
    margin-top: 2%;
}

/* Hero image */
.hero {
    position: relative;
    height: 500px;
    overflow: hidden;
    border-radius: 10px;
}

ion-img.hero-image::part(image) {
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
    margin: 0;
    margin-bottom: 10px;
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