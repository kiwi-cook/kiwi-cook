<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :big-text="['Taste Buddy', 'Editor']" />

                    <table>
                        <caption>Taste Buddy Stats</caption>
                        <tr>
                            <th scope="col">
                                Stat
                            </th>
                            <th>
                                Value
                            </th>
                        </tr>
                        <tr>
                            <td>
                                Amount Recipes
                            </td>
                            <td>
                                {{ recipes.length }}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Amount Items
                            </td>
                            <td>
                                {{ items.length }}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {IonContent, IonPage} from '@ionic/vue';
import {useRecipeStore} from "@/editor/storage";
import {computed} from "vue";
import FancyHeader from "@/shared/components/utility/fancy/FancyHeader.vue";

const recipeStore = useRecipeStore()
const recipes = computed(() => recipeStore.getRecipesAsList)
const items = computed(() => recipeStore.getItemsAsList)
</script>

<style scoped>
table {
    width: 100%;
}
</style>