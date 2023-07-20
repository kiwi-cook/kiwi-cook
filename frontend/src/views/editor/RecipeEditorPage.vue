<template>
    <IonPage id="recipe-editor-page">
        <IonHeader>
            <IonToolbar>
                <IonTitle>Recipe Editor</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent :fullscreen="true">
            <div class="content">
                <IonRefresher slot="fixed" @ion-refresh="handleRefresh($event)">
                    <IonRefresherContent/>
                </IonRefresher>
                <RecipeEditor v-if="recipe" :key="recipe?.getId()" :recipe="recipe"/>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton color="tertiary" @click="goBack()">
                    <IonIcon :icon="arrowBack"/>
                </IonFabButton>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, onMounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonTitle,
    IonToolbar,
    useIonRouter
} from '@ionic/vue';
import {Recipe} from '@/tastebuddy/types';
import {useTasteBuddyStore} from '@/storage';
import RecipeEditor from "@/components/editor/RecipeEditor.vue";
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
        const recipe: ComputedRef<Recipe> = computed(() => store.getRecipesAsMap[recipeId.value]);
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
            mutableRecipe.value?.update()?.save()
        }

        onMounted(() => {
            document.addEventListener("keydown", handleSave, false);
        })

        const handleRefresh = async (event: any) => {
            store.fetchRecipes().then(() => {
                // set timeout to avoid sus behaviour :)
                setTimeout(() => {
                    // 'complete' tells the refresher to close itself
                    event.detail.complete()
                }, 1700)
            })
        }


        const router = useIonRouter()
        const goBack = () => router.back()

        return {
            recipe,
            handleRefresh,
            goBack, arrowBack
        }
    }
})
</script>