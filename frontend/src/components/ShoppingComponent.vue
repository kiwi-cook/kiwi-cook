<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Shopping</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-toolbar color="primary">
            <ion-searchbar color="secondary" :debounce="100" @ion-change="handleShoppingFilter($event)"></ion-searchbar>
        </ion-toolbar>
        <div class="container">
            <div id="filter-relevanz-button">
                <ion-button color="primary">
                    <IonLabel color="light">
                        Filter
                    </IonLabel>
                </ion-button>
                <ion-button color="primary">
                    <ion-icon color="light" slot="icon-only" :icon="arrowDown"></ion-icon>
                    <IonLabel color="light">
                        Relevanz
                    </IonLabel>
                </ion-button>
            </div>
        </div>

        <ion-content>
            <ion-accordion-group expand="inset">
                <template v-for="market in filteredMarkets" :key="market.name">
                    <ion-accordion :value="market.name">
                        <ion-item slot="header" color="primary">
                            <ion-label color="light">{{ market.name }}</ion-label>
                        </ion-item>
                        <div slot="content">
                            <div class="discount-items" style="background-color: #444953;">
                                <template v-for="(item, itemIndex) in market.items" :key="item.name + itemIndex + market.name">
                                    <div class="discount-item">
                                        <div class="imgContainer">
                                            <ion-img class="discount-img" :src="item.imgPath" :alt="item.name + ' Pic'">
                                            </ion-img>
                                            <IonLabel color="light">
                                                {{ item.name }}<br>- {{ item.reduced }}% <br>{{ item.price }} €
                                            </IonLabel>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </ion-accordion>
                </template>
            </ion-accordion-group>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonToolbar, IonSearchbar, IonImg, IonContent, IonPage, IonTitle, IonIcon, IonHeader, IonButton, IonAccordion, IonAccordionGroup, IonItem, IonLabel } from '@ionic/vue';
import { caretDownCircle, filter, arrowDown } from 'ionicons/icons';
import { defineComponent, ref } from 'vue';


export default defineComponent({
    name: 'ShoppingComponent',
    components: {
        IonContent,
        IonSearchbar,
        IonTitle,
        IonPage,
        IonIcon,
        IonImg,
        IonButton,
        IonHeader,
        IonToolbar,
        IonAccordion,
        IonAccordionGroup,
        IonItem,
        IonLabel
    },
    setup() {

        const corn = {
            name: "Corn",
            imgPath: "assets/ingredients/corn.jpeg",
            price: "1,00",
            reduced: 30
        }

        const tomato = {
            name: "Tomato",
            imgPath: "assets/ingredients/tomato.jpeg",
            price: "3,99",
            reduced: 30
        }

        const burger = {
            name: "Hamburger",
            imgPath: "assets/food/food_hamburger.jpeg",
            price: "2,50",
            reduced: 40
        }

        type Market = {
            name: string;
            items: {
                name: string;
                imgPath: string;
                price: string;
                reduced: number;
            }[];
        }

        const markets: Market[] = [
            {
                name: "Edeka",
                items: [
                    corn,
                    tomato
                ]
            },
            {
                name: "Rewe",
                items: [
                    corn
                ]
            },
            {
                name: "Aldi Süd",
                items: [
                    tomato,
                    burger,
                    tomato,
                    burger,
                    corn,
                    burger,
                ]
            }
        ]

        const filteredMarkets = ref<Market[]>(markets);

        const handleShoppingFilter = (event: any) => {
            const query = event.target.value.toLowerCase();
            // return if query is empty
            if (query === "") {
                filteredMarkets.value = markets
                return
            }

            // filter markets
            filteredMarkets.value = markets.reduce((filteredMarkets: Market[], market: Market) => {
                // get all items of a market and check if query is included in item name
                const filteredItems = market.items.filter(item => item.name.toLocaleLowerCase().includes(query))
                
                // check if items were found
                if (filteredItems.length > 0) {
                    // if items were found, return already filteredMarkets and add market with filtered items
                    return [...filteredMarkets, { name: market.name, items: filteredItems }]
                }

                // if not, just return filtered markets
                return filteredMarkets
            }, [])
        }

        return { filteredMarkets, caretDownCircle, handleShoppingFilter, filter, arrowDown, };

    },
});
</script>
<style scoped>
.discount-items {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-self: center;
    /*background-color: #2196F3;*/
}

.discount-item {
    text-align: center;
    font-size: 100%;
    margin: 10px;
    max-width: 100px;
}

.discount-img {
    object-fit: cover;
    width: 100px;
    height: 100px;
}

.imgContainer {
    /*background-color: #F28705;*/
    max-width: fit-content;
    max-height: 250px;


}

/**Nicht beachten drunter */
.container {
    text-align: center;
    /*background-color: aquamarine;*/
}

#filter-relevanz-button {
    margin: 2%;
}
</style>