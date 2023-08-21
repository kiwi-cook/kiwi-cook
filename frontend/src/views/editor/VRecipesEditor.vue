<template>

    <IonPage id="items-editor-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <FancyHeader :big-text="['Recipe', 'Parser']"/>

                <!-- File uploader for JSON recipes files -->
                <h2>
                    Upload recipes
                </h2>
                <label class="file-input-label" for="file-input">
                    Recipe JSON file<br/>
                    <input id="file-input" ref="file" type="file" accept=".json" @change="onFileChange"/>
                </label>

                <!-- List of recipes -->
                <h2>
                    {{ parsedRecipes.length }} Recipes
                </h2>
                <ul class="recipe-button-list">
                    <li v-for="recipe in parsedRecipes" :key="recipe.getId()">
                        <IonButton size="small" fill="outline" @click="showEditor(recipe.getId())">
                            {{ recipe.getName() }}
                        </IonButton>
                    </li>
                </ul>

                <!-- Recipe editor -->
                <h2>
                    Recipe Editor
                </h2>
                <RecipeEditor v-if="selectedRecipe !== null" :recipe="selectedRecipe"/>

            </div>

            <!-- Buttons -->
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton>
                    <IonIcon :icon="chevronForwardCircle"/>
                </IonFabButton>
                <IonFabList side="end">
                    <IonFabButton @click="addRecipe()">
                        <IonIcon :icon="addOutline"/>
                    </IonFabButton>
                    <IonFabButton @click="saveRecipes()">
                        <IonIcon :icon="saveOutline"/>
                    </IonFabButton>
                </IonFabList>
            </IonFab>
        </IonContent>
    </IonPage>
</template>


<script lang="ts">
import {defineComponent, ref} from "vue";
import {logError, parseRecipes, Recipe, RecipeParser} from "@/tastebuddy";
import {IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonPage, useIonRouter} from "@ionic/vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import {addOutline, chevronForwardCircle, saveOutline} from "ionicons/icons";
import {useRecipeStore} from "@/storage";
import RecipeEditor from "@/components/editor/RecipeEditor.vue";

export default defineComponent({
    name: 'RecipeParser',
    components: {
        RecipeEditor,
        IonFabList,
        IonFabButton,
        IonIcon,
        IonFab,
        FancyHeader,
        IonContent,
        IonPage,
        IonButton
    },
    setup() {
        const router = useIonRouter()
        const recipeStore = useRecipeStore()

        const parsedRecipes = ref<Recipe[]>([])
        const file = ref<File | null>(null)
        const out = ref<string>("")

        const onFileChange = (event: any) => {
            file.value = event.target.files[0]
            if (file.value) {
                const reader = new FileReader()
                reader.readAsText(file.value, "UTF-8")
                reader.onload = (evt) => {
                    if (evt.target) {
                        parseRecipes(evt.target.result as string, {
                            parser: RecipeParser.Cookstr,
                            list: parsedRecipes,
                            max: 500
                        })
                    }
                }
                reader.onerror = (evt) => {
                    logError('parseRecipes', evt)
                }
            }
        }

        const addRecipe = () => {
            const newRecipeId = Recipe.newRecipe().update()._tmpId
            router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
        }
        const saveRecipes = () => {
            recipeStore.saveRecipes(parsedRecipes.value)
        }

        const selectedRecipe = ref<Recipe | null>(null)
        const showEditor = (id: string) => {
            selectedRecipe.value = parsedRecipes.value.find(recipe => recipe.getId() === id) ?? null
        }

        return {
            // JSON
            file, out,
            onFileChange,
            parsedRecipes,
            // editor
            showEditor, selectedRecipe,
            // methods
            addRecipe, saveRecipes,
            // types
            Recipe,
            // icons
            chevronForwardCircle, addOutline, saveOutline,
        }
    }
})
</script>

<style scoped>
.recipe-button-list {
    max-height: 200px;
    overflow-y: auto;
}
</style>
