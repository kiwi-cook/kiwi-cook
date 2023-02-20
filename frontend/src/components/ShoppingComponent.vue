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
                        <div slot="content" class="discount-items" style="background-color: #444953;">
                            <template v-for="(item, itemIndex) in market.items"
                                :key="item.name + itemIndex + market.name">
                                <ion-card class="discount-item" :button="true" @click="selectItem(item)">
                                    <ion-thumbnail>
                                        <img class="discount-img" :src="item.imageUrl" :alt="item.title + ' Pic'" />
                                    </ion-thumbnail>
                                    <ion-card-title color="light">
                                        {{ item.title }}
                                    </ion-card-title>
                                    <ion-card-subtitle color="light">
                                        {{ item.price }} €
                                    </ion-card-subtitle>
                                    <!-- <ion-label color="light" position="stacked">
                                        {{ item. }}% reduziert
                                    </ion-label> -->
                                </ion-card>
                            </template>
                        </div>
                    </ion-accordion>
                </template>
            </ion-accordion-group>

            <div class="container">
                <ion-list>
                    <template v-for="item in selectedItems" :key="item.name">
                        <ion-item color="primary">
                            <ion-label>{{ item.title }}</ion-label>
                        </ion-item>
                    </template>
                </ion-list>
                <ion-label v-if="selectedItems.length > 0" color="light">
                    Gesamtpreis {{ price }} €
                </ion-label>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { Discount } from '@/api/types';
import { useTasteBuddyStore } from '@/storage';
import { IonToolbar, IonSearchbar, IonThumbnail, IonContent, IonPage, IonTitle, IonIcon, IonHeader, IonButton, IonAccordion, IonAccordionGroup, IonItem, IonList, IonLabel, IonCard, IonCardTitle, IonCardSubtitle } from '@ionic/vue';
import { computed, ComputedRef } from '@vue/reactivity';
import { caretDownCircle, filter, arrowDown } from 'ionicons/icons';
import { defineComponent, ref, watch } from 'vue';


export default defineComponent({
    name: 'ShoppingComponent',
    components: {
        IonContent,
        IonSearchbar,
        IonTitle,
        IonPage,
        IonIcon,
        IonButton,
        IonHeader,
        IonToolbar,
        IonAccordion,
        IonAccordionGroup,
        IonItem,
        IonLabel
    },
    setup() {
        const store = useTasteBuddyStore();
        // Get discounts from store
        const discounts = computed(() => store.getters.getDiscounts('Konstanz'));

        // Custom simplified type for markets
        type Market = { name: string, items: Discount[] };

        // Create markets from discounts
        const markets: ComputedRef<Market[]> = computed(() => discounts.value.reduce((markets: Market[], discount: Discount) => {
            const market = markets.find(market => market.name === discount.marketName);
            if (market) {
                market.items.push(discount);
            } else {
                markets.push({ name: discount.marketName, items: [discount] });
            }
            return markets;
        }, []));

        // Use filteredMarkets to filter markets
        const filteredMarkets = ref<Market[]>(markets.value);
        // Update filteredMarkets when markets value changes
        watch(markets, () => {
            filteredMarkets.value = markets.value
        })

        // Filter markets by query
        const handleShoppingFilter = (event: any) => {
            const query: string = event.target.value.toLowerCase().trim();
            // return if query is empty
            if (query === "") {
                filteredMarkets.value = markets.value
                return
            }

            // split by separator, e.g. ","
            const queries: string[] = query.split(",").map((q: string) => q.trim())
            console.log(queries);
            

            // filter markets
            filteredMarkets.value = markets.value
                // filter and map markets using reduce(...)
                .reduce((filteredMarkets: Market[], market: Market) => {
                    // get all items of a market and check if query is included in item name
                    const filteredItems = market.items.filter(item => queries.some((q: string) => item.title.toLocaleLowerCase().includes(q) && q !== ""))

                    // check if items were found
                    if (filteredItems.length > 0) {
                        // if items were found, return already filteredMarkets and add market with filtered items
                        return [...filteredMarkets, { name: market.name, items: filteredItems }]
                    }

                    // if not, just return filtered markets
                    return filteredMarkets
                }, [])
                // sort markets by their name
                .sort((a: Market, b: Market) => a.name.localeCompare(b.name))
        }

        // List of selected items
        const selectedItems = ref<Discount[]>([])
        // Handle item selection
        const selectItem = (item: Discount) => {
            if (selectedItems.value.includes(item)) {
                selectedItems.value = selectedItems.value.filter(selectedItem => selectedItem !== item)
            } else {
                selectedItems.value = [...selectedItems.value, item]
            }
        }
        // Calculate price of selected items
        const price = computed(() => selectedItems.value.reduce((price, item) => price + parseFloat(item.price), 0))

        return {
            handleShoppingFilter, selectItem,
            filteredMarkets, selectedItems, price,
            arrowDown
        }
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