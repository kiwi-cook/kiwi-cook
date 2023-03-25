<template>
    <ion-accordion-group expand="inset">
        <template v-for="market in filteredMarkets" :key="market?.name">
            <ion-accordion :value="market?.name">
                <ion-item slot="header" color="primary">
                    <ion-label>{{ market?.name }}</ion-label>
                </ion-item>
                <div slot="content" class="discount-items" style="background-color: #444953;">
                    <template v-for="(item, itemIndex) in market?.items" :key="item?._id + itemIndex + market?.name">
                        <ion-card :button="true" class="discount-item" @click="selectItem(item)">
                            <ion-thumbnail>
                                <img :alt="item?.title + ' Pic'" :src="item?.imageUrl" class="discount-img" />
                            </ion-thumbnail>
                            <ion-card-title>
                                {{ item?.title }}
                            </ion-card-title>
                            <ion-card-subtitle>
                                {{ item?.price }} €
                            </ion-card-subtitle>
                            <!-- <ion-label  position="stacked">
                              {{ item. }}% reduziert
                          </ion-label> -->
                        </ion-card>
                    </template>
                </div>
            </ion-accordion>
        </template>
    </ion-accordion-group>

    <div class="center">
        <ion-list>
            <template v-for="item in selectedItems" :key="item._id">
                <ion-item color="primary">
                    <ion-label>{{ item.title }}</ion-label>
                    {{ item.marketName }}
                </ion-item>
            </template>
        </ion-list>
        <ion-label v-if="selectedItems.length > 0">
            Gesamtpreis {{ price }} €
        </ion-label>
    </div>
</template>

<script lang="ts">
import { Discount } from '@/api/types';
import { useTasteBuddyStore } from '@/storage';
import {
    IonAccordion,
    IonAccordionGroup,
    IonCard,
    IonCardSubtitle,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonList,
    IonThumbnail
} from '@ionic/vue';
import { arrowDown } from 'ionicons/icons';
import { computed, ComputedRef, defineComponent, ref, toRefs, watch } from 'vue';


export default defineComponent({
    name: 'ShoppingComponent',
    props: {
        filter: {
            type: String,
            required: false,
            default: ''
        }
    },
    components: {
        IonList, IonCard, IonCardTitle, IonThumbnail, IonCardSubtitle, IonAccordion, IonAccordionGroup, IonItem, IonLabel
    },
    setup(props: any) {
        const { filter } = toRefs(props)

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
        const handleShoppingFilter = () => {
            const query: string = filter.value.toLowerCase().trim();
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

        watch(filter, () => {
            handleShoppingFilter()
        }, { immediate: true })

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