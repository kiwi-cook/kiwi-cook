<template>
    <IonPage id="items-editor-page">
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="['Recipe Parser']"/>

                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                Parse recipes {{ selectedParser ? `with ${selectedParser}` : '' }}
                            </IonCardTitle>
                            <IonCardSubtitle>
                                Select the recipe parser
                            </IonCardSubtitle>
                        </IonCardHeader>

                        <IonCardContent>
                            <!-- File uploader for JSON recipes files -->
                            <IonItem class="ion-no-padding" lines="none">
                                <label for="recipe-parser">
                                    Recipe parser
                                </label>
                                <select id="recipe-parser" v-model="selectedParser">
                                    <option v-for="parser in availableParsers" :key="parser">
                                        {{ parser }}
                                    </option>
                                </select>
                            </IonItem>

                            <IonItem class="ion-no-padding" lines="none">
                                <label for="file-input">
                                    Recipe JSON file<br/>
                                </label>
                                <input id="file-input" ref="file" accept=".json" type="file" @change="onFileChange"/>
                            </IonItem>
                        </IonCardContent>
                    </IonCard>

                    <!-- List of recipes -->
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                {{ parsedRecipes.length }} Recipes
                            </IonCardTitle>
                            <IonCardSubtitle>
                                Select the recipe parser
                            </IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <ul class="recipe-button-list">
                                <li v-for="recipe in parsedRecipes" :key="recipe.getId()">
                                    <IonButton fill="outline" size="small" @click="showEditor(recipe.getId())">
                                        {{ recipe.getName() }}
                                    </IonButton>
                                </li>
                            </ul>
                        </IonCardContent>
                    </IonCard>

                    <!-- Recipe editor -->
                    <h2>
                        Recipe Editor
                    </h2>
                    <RecipeEditor v-if="selectedRecipe !== null" :recipe="selectedRecipe"/>

                </div>
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


<script lang="ts" setup>
import {ref} from "vue";
import Header from "@/shared/components/utility/header/Header.vue";
import {addOutline, chevronForwardCircle, saveOutline} from "ionicons/icons";
import {useRecipeStore} from "@/editor/storage";
import RecipeEditor from "@/editor/components/editor/RecipeEditor.vue";
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonFabList,
    IonIcon,
    IonItem,
    IonPage,
    useIonRouter
} from "@ionic/vue";
import {availableParsers, parseRecipes, RecipeParser} from "@/editor/parser";
import {logError, Recipe} from "@/shared/ts";
import {MutableRecipe} from "@/editor/types/recipe.ts";

const router = useIonRouter()
const recipeStore = useRecipeStore()

const parsedRecipes = ref<MutableRecipe[]>([])
const file = ref<File | null>(null)
const selectedParser = ref<RecipeParser>(RecipeParser.Cookstr)

const onFileChange = (event: any) => {
    file.value = event.target.files[0]
    if (file.value) {
        const reader = new FileReader()
        reader.readAsText(file.value, "UTF-8")
        reader.onload = (evt) => {
            if (evt.target) {
                parseRecipes(evt.target.result as string, {
                    parser: selectedParser.value,
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
    const newRecipeId = MutableRecipe.newRecipe().update().getId()
    router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
}
const saveRecipes = () => {
    recipeStore.saveRecipes(parsedRecipes.value)
}

const selectedRecipe = ref<Recipe | null>(null)
const showEditor = (id: string) => {
    selectedRecipe.value = parsedRecipes.value.find(recipe => recipe.getId() === id) ?? null
}
</script>

<style scoped>
.recipe-button-list {
    max-height: 200px;
    overflow-y: auto;
}
</style>
