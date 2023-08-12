<template>
    <IonPage id="recipe-editor-page">
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <h1>
                        Recipe Editor
                    </h1>
                    <RecipeEditor v-if="recipe" :key="recipe?.getId()" :recipe="recipe"/>
                </div>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton>
                    <IonIcon :icon="chevronForwardCircle"/>
                </IonFabButton>
                <IonFabList side="end">
                    <IonFabButton @click="goBack()">
                        <IonIcon :icon="arrowBack"/>
                    </IonFabButton>
                    <IonFabButton @click="addRecipe()">
                        <IonIcon :icon="addOutline"/>
                    </IonFabButton>
                    <IonFabButton @click="recipe.save()">
                        <IonIcon :icon="saveOutline"/>
                    </IonFabButton>
                </IonFabList>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, onMounted, onUnmounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonPage, useIonRouter} from '@ionic/vue';
import {Recipe} from '@/tastebuddy/types';
import {useRecipeStore} from '@/storage';
import RecipeEditor from "@/components/editor/RecipeEditor.vue";
import {addOutline, arrowBack, chevronForwardCircle, saveOutline} from "ionicons/icons";

export default defineComponent({
    name: 'RecipeEditorPage',
    components: {
        IonFabList,
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

        const addRecipe = () => {
            const newRecipeId = Recipe.newRecipe().update()._tmpId
            router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
        }

        return {
            recipe,
            goBack, addRecipe,
            // icons
            arrowBack, addOutline, saveOutline, chevronForwardCircle
        }
    }
})
</script>