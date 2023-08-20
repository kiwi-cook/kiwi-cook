<template>
    <div class="recipe-hero">
        <IonImg :alt="`Image of ${recipe?.getName()}`" :class="['hero-image', { 'link': routable }]"
                :src="recipe?.props?.imgUrl ?? ''" @click="toRecipe()"/>
        <div class="hero-content">

            <div class="hero-text">
                <h1 class="recipe-name">{{ recipe?.getName() }}</h1>
                <p v-if="!noDescription" class="recipe-description">{{ recipe?.getShortDescription() }}</p>
                <h2 v-if="recipe.getAuthors() !== ''" class="recipe-author">
                    By <a :href="recipe?.props?.url" target="_blank">{{ recipe?.getAuthors() }}</a>
                </h2>
            </div>
            <div class="hero-bottom">
                <div class="hero-buttons">
                    <slot name="buttons">
                        <IonButton v-if="likable" class="hero-button" color="primary" @click="recipe?.toggleLike()">
                            <IonIcon :icon="isLiked ?? false ? heart: heartOutline"/>
                        </IonButton>
                        <IonButton v-if="canShareRecipe" class="hero-button" color="primary"
                                   @click="shareRecipe()">
                            <IonIcon slot="icon-only" :icon="shareOutline" aria-valuetext="Share Recipe"/>
                        </IonButton>
                        <IonButton v-if="isDevMode" class="hero-button" color="secondary"
                                   @click="editRecipe()">
                            <IonIcon :icon="create"/>
                        </IonButton>
                    </slot>
                </div>
                <div class="hero-tags">
                    <div v-if="recipe?.getTags().length > 0" class="flex">
                        <IonChip v-for="tag in recipe?.getTags()" :key="tag" class="hero-tag" color="light">
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
                            <IonIcon :icon="time"/>
                            <IonLabel>{{ recipe?.getDuration() }} min.</IonLabel>
                        </IonChip>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, ref, toRefs} from "vue";
import {IonButton, IonChip, IonIcon, IonImg, IonLabel, useIonRouter} from "@ionic/vue";
import {create, heart, heartOutline, link, restaurant, shareOutline, time} from "ionicons/icons";
import {useRecipeStore, useTasteBuddyStore} from "@/storage";
import {formatDate, Recipe} from "@/tastebuddy";
import {CanShareResult, Share} from "@capacitor/share";

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
        },
        likable: {
            type: Boolean,
            default: true
        },
        shareable: {
            type: Boolean,
            default: true
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
        const recipeStore = useRecipeStore()
        const isLiked = computed(() => recipeStore.getSavedRecipesAsMap[recipe.value?.getId() ?? ''] ?? false)

        // share
        const shareRecipe = () => recipe.value?.share();
        // check if the browser supports sharing
        const canShareRecipe = ref(false);
        Share.canShare().then((canShareResult: CanShareResult) => {
            canShareRecipe.value = canShareResult.value;
        })


        const tasteBuddyStore = useTasteBuddyStore()
        const isDevMode = computed(() => tasteBuddyStore.isDevMode)
        const editRecipe = () => {
            if (isDevMode.value) {
                router.push({name: 'RecipeEditor', params: {id: recipe.value.getId()}})
            }
        }

        return {
            isLiked,
            toRecipe,
            formatDate, editRecipe, isDevMode,
            // icons
            heart, heartOutline, restaurant, link, create, time,
            // share
            canShareRecipe, shareRecipe, shareOutline,
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
    border-radius: var(--border-radius);
}

.hero-image {
    aspect-ratio: 20/19;
}

.hero-image::part(image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--border-radius);
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
    font-size: var(--font-size-huge);
    font-weight: var(--font-weight-bold);
    margin: 0 0 10px;
}

.hero-text h2.recipe-author {
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-normal);
}

.recipe-author a {
    color: inherit;
}

.hero-text p.recipe-description {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-normal);
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

    .hero-bottom {
        padding: 0 10px 10px;
    }

    .hero-buttons {
        padding: 0 5px;
    }

    .hero-button {
        font-size: var(--font-size-small);
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

    .hero-text p.recipe-description {
        display: none;
    }

    .hero-text h2.recipe-author {
        margin-top: 0;
        margin-bottom: 0;
    }


    .hero-tags {
        margin-top: 0;
    }

    .hero-bottom {
        padding: 0 5px 5px;
    }

    .hero-buttons {
        padding: 0 5px;
    }

    /* shadow part of hero-button */
    .hero-button::part(native) {
        border-radius: var(--border-radius-round);
        width: 30px;
        height: 30px;
        padding: 5px;
    }
}
</style>