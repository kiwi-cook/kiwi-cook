<template>
    <ionPage>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Search</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-toolbar color="primary">
            <ion-searchbar color="secondary" :debounce="100" @ion-change="handleChange($event)"></ion-searchbar>
        </ion-toolbar>
        <div class="container">
            <div class="filter-relevanz-button">
                <ion-button color="primary">
                    <ion-icon color="light" slot="icon-only" :icon="filter"></ion-icon>
                    <ion-label color="light">
                        Filter
                    </ion-label>
                </ion-button>
                <ion-button color="primary">
                    <ion-icon color="light" slot="icon-only" :icon="arrowDown"></ion-icon>
                    <ion-label color="light">
                        Relevanz
                    </ion-label>
                </ion-button>
            </div>
        </div>

        <ion-content class="ion-padding">
            <template v-for="recipe in filteredRecipe" :key="recipe.name">
                <ion-list :value="recipe.name">
                    <ion-item slot="header" color="primary">
                        <ion-label color="light">{{ recipe.name }}</ion-label>
                    </ion-item>
                    <div slot="content">
                        <div class="recipe-items">
                            <template v-for="item in recipe.items" :key="item.name + recipe.name">
                                <div class="recipe-item">
                                    <div class="img-container">
                                        <ion-img class="recipe-img" :src="item.imgPath" :alt="item.name + ' Pic'">
                                        </ion-img>
                                        <IonLabel color="light">
                                                {{ item.name }}
                                        </IonLabel>
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
import { IonPage, IonList, IonItem, IonImg, IonTitle, IonIcon, IonButton, IonContent, IonHeader, IonToolbar, IonSearchbar, IonLabel } from '@ionic/vue';
import { defineComponent, ref, vShow } from 'vue';
import { filter, arrowDown } from 'ionicons/icons';


export default defineComponent({
    name: "SearchComponent",
    components: { IonPage, IonList, IonItem, IonImg, IonTitle, IonIcon, IonContent, IonButton, IonHeader, IonToolbar, IonSearchbar, IonLabel },
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

        return { filteredRecipe, handleChange, filter, arrowDown, vShow };

    }
});
</script>

<style scoped>
.container {
    text-align: center;
    /*background-color: aquamarine;*/
}

.filter-relevanz-button {
    margin: 2%;
    color: white;
}

.recipe-items {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-self: center;
    /*background-color: #2196F3;*/
}

.recipe-item {
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


.img-container{
    /*background-color: #F28705;*/
    max-width: fit-content;
    max-height: 150px;

}

/* Transition */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
</style>
