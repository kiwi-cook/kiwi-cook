<template>
    <div class="recipe-hero">
        <IonImg :alt="`Image of ${recipe?.name}`" :class="['hero-image', { 'link': routable }]"
                :src="recipe?.props?.imgUrl ?? ''" @click="toRecipe()"/>
        <div class="hero-content">

            <div class="hero-text">
                <h1 class="recipe-name">{{ recipe?.name }}</h1>
                <p v-if="!noDescription" class="recipe-description">{{ recipe?.getShortDescription() }}</p>
                <h2 class="recipe-author">By {{ recipe?.getAuthors() }}</h2>
            </div>
            <div class="hero-bottom">
                <div class="hero-buttons">
                    <slot name="buttons">
                        <IonButton v-if="routable" class="hero-button hero-button-view-recipe-big" color="primary"
                                   shape="round" aria-description="Route to recipe" @click="toRecipe(true)">View Recipe
                        </IonButton>
                        <IonButton v-if="routable" class="hero-button hero-button-view-recipe-small" color="primary"
                                   aria-description="Route to recipe"
                                   shape="round" @click="toRecipe(true)">
                            <IonIcon :icon="restaurant"/>
                        </IonButton>
                        <IonButton class="hero-button" color="primary" shape="round" @click="recipe?.toggleLike()">
                            <IonIcon :icon="isLiked ?? false ? heart: heartOutline"/>
                        </IonButton>
                    </slot>
                </div>
                <div class="hero-tags">
                    <div v-if="(recipe?.props?.tags ?? []).length > 0" class="flex">
                        <IonChip v-for="tag in recipe?.props.tags" :key="tag" class="hero-tag" color="light">
                            <IonLabel>{{ tag }}</IonLabel>
                        </IonChip>
                    </div>
                    <div v-if="(additionalTags ?? []).length > 0" class="flex">
                        <IonChip v-for="tag in additionalTags" :key="tag" class="hero-tag" color="light">
                            <IonLabel>{{ tag }}</IonLabel>
                        </IonChip>
                    </div>
                    <div class="flex">
                        <IonChip class="hero-tag" color="light">
                            <IonLabel>{{ recipe?.getDuration() }} minutes</IonLabel>
                        </IonChip>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Recipe} from "@/tastebuddy/types";
import {IonButton, IonChip, IonIcon, IonImg, IonLabel, useIonRouter} from "@ionic/vue";
import {formatDate} from "@/utility/util";
import {heart, heartOutline, restaurant} from "ionicons/icons";
import {useTasteBuddyStore} from "@/storage";

export default defineComponent({
    name: 'RecipeHero',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true
        },
        additionalTags: {
            type: Array as PropType<string[]>,
            default: () => []
        },
        noDescription: {
            type: Boolean,
            default: false
        },
        routable: {
            type: Boolean,
            default: false
        }
    },
    components: {
        IonIcon,
        IonImg, IonChip, IonLabel, IonButton
    },
    setup(props: any) {
        const {recipe, routable} = toRefs(props);

        const router = useIonRouter();
        const toRecipe = (override = false) => {
            if (routable.value || override) {
                router.push({name: 'Recipe', params: {id: recipe.value?.getId()}})
            }
        }
        const store = useTasteBuddyStore();
        const isLiked = computed(() => store.getSavedRecipesAsMap[recipe.value?.getId() ?? ''] ?? false)

        return {
            isLiked,
            toRecipe,
            formatDate,
            // icons
            heart, heartOutline, restaurant
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

.hero-image {
    aspect-ratio: 20/19;
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

.hero-bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px 30px;
}

.hero-buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    margin-bottom: 15px;
    padding: 0 15px;
    gap: 10px;
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

.hero-button-view-recipe-small {
    display: none;
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

    .hero-bottom {
        padding: 0 10px 10px;
    }

    .hero-buttons {
        padding: 0 5px;
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
        padding: 10px;
    }

    .hero-text h1.recipe-name {
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

    .hero-bottom {
        padding: 0 5px 5px;
        flex-direction: column;
    }

    .hero-buttons {
        padding: 0 5px;
    }

    .hero-button-view-recipe-big {
        display: none;
    }

    .hero-button-view-recipe-small {
        display: block;
    }
}
</style>