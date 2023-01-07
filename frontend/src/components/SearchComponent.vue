<template>
    <ionPage>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>Search</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-toolbar color="primary">
            <ion-searchbar :debounce="100" @ion-change="handleChange($event)"></ion-searchbar>
        </ion-toolbar>
        <div class="container">
            <div id="FilterRelevanzButton">
                <ion-button color="primary">
                    <ion-icon slot="icon-only" :icon="filter"></ion-icon>
                    Filter
                </ion-button>
                <ion-button color="primary">
                    <ion-icon slot="icon-only" :icon="arrowDown"></ion-icon>
                    Relevanz
                </ion-button>
            </div>
        </div>

        <ion-content class="ion-padding">
            <template v-for="recipe in filteredRecipe" :key="recipe.name">
                <ion-list :value="recipe.name">
                    <ion-item slot="header" color="primary">
                        <ion-label>{{ recipe.name }}</ion-label>
                    </ion-item>
                    <div slot="content">
                        <div class="recipe-items">
                            <template v-for="item in recipe.items" :key="item.name + recipe.name">
                                <div class="recipe-item">
                                    <div class="imgContainer">
                                        <ion-img class="recipe-img" :src="item.imgPath" :alt="item.name + ' Pic'">
                                        </ion-img>
                                        <p>
                                            {{ item.name }}
                                        </p>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </ion-list>
            </template>
        </ion-content>
    </ionPage>
</template>

<script lang="ts">
import { IonPage, IonButton, IonContent, IonHeader, IonToolbar, IonSearchbar } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { filter, arrowDown } from 'ionicons/icons';


export default defineComponent({
    components: { IonPage, IonContent, IonButton, IonHeader, IonToolbar, IonSearchbar },
    setup() {
        const Bolognese = {
            name: "Bolognese Pasta",
            imgPath: "assets/ingredients/corn.jpeg",
        }

        const Alioolio = {
            name: "Knobi Pasta",
            imgPath: "assets/ingredients/tomato.jpeg",

        }

        const fleischSalat = {
            name: "Fleisch Salat",
            imgPath: "assets/food/food_hamburger.jpeg",

        }

        const recipe = [
            {
                name: "Pasta",
                items: [
                    Bolognese,
                    Alioolio
                ]
            },
            {
                name: "Salat",
                items: [
                    fleischSalat
                ]
            },
        ]

        const filteredRecipe = ref(recipe);

        const handleChange = (event: any) => {
            const query = event.target.value.toLowerCase();
            filteredRecipe.value = recipe.filter(recipe => {
                const itemNames: string[] = recipe.items.map(item => item.name.toLowerCase())
                return itemNames.includes(query)
            });
        }

        return { filteredRecipe, handleChange, filter, arrowDown, };

    }
});
</script>

<style scoped>
.container {
    text-align: center;
    /*background-color: aquamarine;*/
}

#FilterRelevanzButton {
    margin: 2%;
}

.recipe-items {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-self: center;
    /*background-color: #2196F3;*/
}

.recipe-item {
    background-color: lightsalmon;
    text-align: center;
    font-size: 100%;
    margin: 10px;
    max-width: 100px;
}

.recipe-img {
    object-fit: cover;
    width: 100px;
    height: 100px;
}
</style>
