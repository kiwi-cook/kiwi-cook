<template>
    <ion-list>
        <ion-item v-for="result in filteredIngredients" :key="result.val">
            <ion-label>{{ result.val }}</ion-label>
            <ion-checkbox slot="end" :modelValue="result?.isChecked" @update:modelValue="result.isChecked = $event">
            </ion-checkbox>
        </ion-item>
    </ion-list>
    <div class="SearchButton">
        <ion-button color="primary">Search</ion-button>
    </div>
</template>

<script lang="ts">
import {Item} from '@/api/types';
import {useTasteBuddyStore} from '@/storage';
import {IonButton, IonCheckbox, IonItem, IonLabel, IonList} from '@ionic/vue';
import {computed, defineComponent, ref, toRefs, watch} from 'vue';

export default defineComponent({
    name: 'FridgeComponent',
    props: {
        filter: {
            type: String,
            required: false,
            default: ''
        }
    },
    components: {IonCheckbox, IonLabel, IonButton, IonItem, IonList},
    setup(props: any) {
        const {filter} = toRefs(props)

        const store = useTasteBuddyStore();
        const ingredients = computed(() => store.getters.getItems.map((item: Item) => {
                return {
                    val: item.name,
                    isChecked: false
                }
            }
        ));
        const selectedIngredients = computed(() => ingredients.value.filter((ingredient: any) => ingredient.isChecked));
        const filteredIngredients = ref(ingredients.value.slice(0, 12));
        watch(ingredients, () => {
            filteredIngredients.value = ingredients.value.slice(0, 12);
        })



        /**
         * Filter the ingredients
         */
        const handleFilter = () => {
            const query = filter.value?.toLowerCase() ?? '';
            filteredIngredients.value = ingredients.value
                .filter((d: any) => d.val
                    .toLowerCase()
                    .indexOf(query) > -1 && !selectedIngredients.value.includes(d))
                .slice(0, 12);
            filteredIngredients.value = [...selectedIngredients.value, ...filteredIngredients.value]
        }
        watch(filter, () => {
            handleFilter()
        }, {immediate: true})

        return {filteredIngredients};
    },
});
</script>
<style scoped>
.SearchButton {
    text-align: end;
    margin-right: 95%;
    color: white;
    object-fit: fill;
    width: 100%;
    height: 100%;
}
</style>