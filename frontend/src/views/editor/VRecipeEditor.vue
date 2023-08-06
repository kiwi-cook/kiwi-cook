<template>
    <IonPage id="recipe-editor-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <h1 class="header-title">
                    Recipe Editor
                </h1>
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
import {computed, ComputedRef, defineComponent, onMounted, onUnmounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {IonContent, IonFab, IonFabButton, IonIcon, IonPage, useIonRouter} from '@ionic/vue';
import {Recipe} from '@/tastebuddy/types';
import {useRecipeStore} from '@/storage';
import RecipeEditor from "@/components/editor/RecipeEditor.vue";
import {arrowBack} from "ionicons/icons";

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonIcon, IonFab, IonFabButton,
        RecipeEditor,
        IonPage, IonContent
    },
    setup() {
        const route = useRoute();
        const recipeId = ref(route.params.id as string);
        const store = useRecipeStore();
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

        onUnmounted(() => {
            document.removeEventListener("keydown", handleSave, false);
        })


        const router = useIonRouter()
        const goBack = () => router.back()

        return {
            recipe,
            goBack, arrowBack
        }
    }
})
</script>