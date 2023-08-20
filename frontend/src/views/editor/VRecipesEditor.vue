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
                <List :list="parsedRecipes">
                    <template #element="{element}">
                        <router-link :to="(element as Recipe).getRoute()">
                            {{ (element as Recipe).getName() }}
                        </router-link>
                    </template>
                </List>

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
import {IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonPage, useIonRouter} from "@ionic/vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import List from "@/components/recipe/List.vue";
import {addOutline, chevronForwardCircle, saveOutline} from "ionicons/icons";
import {useRecipeStore} from "@/storage";

export default defineComponent({
    name: 'RecipeParser',
    components: {IonFabList, IonFabButton, IonIcon, IonFab, List, FancyHeader, IonContent, IonPage},
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
                        parsedRecipes.value = parseRecipes(evt.target.result as string, RecipeParser.Cookstr)
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

        return {
            // JSON
            file, out,
            onFileChange,
            parsedRecipes,
            // types
            Recipe,
            // methods
            addRecipe, saveRecipes,
            // icons
            chevronForwardCircle, addOutline, saveOutline,
        }
    }
})
</script>