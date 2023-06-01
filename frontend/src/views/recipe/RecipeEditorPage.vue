<template>
    <ion-page id="recipe-editor-page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Recipe Editor</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <div class="content">
                <ion-refresher slot="fixed" @ion-refresh="handleRefresh($event)">
                    <ion-refresher-content/>
                </ion-refresher>
                <RecipeEditor v-if="recipe" :recipe="recipe"/>
            </div>
            <ion-fab slot="fixed" horizontal="start" vertical="bottom">
                <ion-fab-button color="tertiary" @click="goBack()">
                    <ion-icon :icon="arrowBack"/>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {Recipe} from '@/tastebuddy/types';
import {useTasteBuddyStore} from '@/storage';
import RecipeEditor from "@/components/editor/RecipeEditor.vue";
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonPage, IonRefresher,
    IonRefresherContent,
    IonTitle,
    IonToolbar
} from "@ionic/vue";
import {arrowBack} from "ionicons/icons";

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonRefresher, IonRefresherContent,
        IonIcon, IonFab, IonFabButton,
        RecipeEditor,
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle
    },
    setup() {
        const route = useRoute();
        const recipeId = ref(route.params.id as string);
        const store = useTasteBuddyStore();
        const recipe = computed(() => store.getters.getRecipesAsMap[recipeId.value]);
        const mutableRecipe = ref<Recipe>(recipe.value);

        watch(recipe, (newRecipe) => {
            mutableRecipe.value = newRecipe;
        })

        const handleSave = (event: any) => {
            if (!(event.keyCode === 83 && (event.ctrlKey || event.metaKey))) {
                return;
            }

            event.preventDefault();
            // save only recipes that are not new
            mutableRecipe.value?.update(store)?.save(store)
        }

        onMounted(() => {
            document.addEventListener("keydown", handleSave, false);
        })

        const handleRefresh = async (event: any) => {
            store.dispatch('fetchRecipes').then(() => {
                // set timeout to avoid sus behaviour :)
                setTimeout(() => {
                    // 'complete' tells the refresher to close itself
                    event.detail.complete()
                }, 1700)
            })
        }


        const router = useRouter()
        const goBack = () => router.back()

        return {
            recipe,
            handleRefresh,
            goBack, arrowBack
        }
    }
})
</script>