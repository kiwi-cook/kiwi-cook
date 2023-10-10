<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :big-text="['Taste Buddy', 'Editor']"/>

                    <table>
                        <tr>
                            <th>Stats</th>
                            <th>Value</th>
                        </tr>
                        <tr v-for="(entry, index) in stats.entries()" :key="index">
                            <td>{{ entry[0] }}</td>
                            <td>{{ entry[1] }}</td>
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

const stats = computed(() => {
    const stats = new Map<string, string | number>()
    stats.set('Amount Recipes', recipes.value.length)
    stats.set('Amount Items', items.value.length)
    return stats
})
</script>

<style scoped>
/* Apply a modern font and some basic styling */
table {
    font-family: Arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

/* Add some padding and styling to the table headers */
th, td {
    padding: 12px 15px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
}

/* Style even and odd rows differently for better readability */
tr:nth-child(even) {
    background-color: #f9f9f9;
}

/* Make the table header text bold */
th {
    font-weight: bold;
}

/* Add some hover effect for better interactivity */
tr:hover {
    background-color: #e2e2e2;
}

/* Apply a border radius to the first and last child of the table body */
tbody tr:first-child td {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

tbody tr:last-child td {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

/* Add a border to the bottom of the table header */
th {
    border-bottom: 2px solid #ddd;
}

/* Apply a border to the bottom of the table body */
td {
    border-bottom: 1px solid #ddd;
}

/* Apply media query for responsiveness */
@media (max-width: 768px) {
    table {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }

    th, td {
        min-width: 150px;
    }
}

</style>