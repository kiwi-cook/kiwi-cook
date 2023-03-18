<template>
    <template v-for="recipe in filteredRecipe" :key="recipe.name">
        <ion-list :value="recipe.name">
            <ion-item slot="header" color="primary">
                <ion-label color="light">{{ recipe.name }}</ion-label>
            </ion-item>
            <SmallItemContainer :items="getItemsFromRecipe(recipe)" />
        </ion-list>
    </template>
</template>

<script lang="ts">
import { IonList, IonItem, IonLabel } from '@ionic/vue';
import { computed, ComputedRef, defineComponent, ref, toRefs, watch } from 'vue';
import { arrowDown } from 'ionicons/icons';
import { useTasteBuddyStore } from '@/storage';
import { Recipe } from '@/api/types';
import { getItemsFromRecipe } from '@/api/utility';
import SmallItemContainer from './item/SmallItemContainer.vue';


export default defineComponent({
    name: "SearchComponent",
    props: {
        filter: {
            type: String,
            required: false,
            default: ''
        }
    },
    components: {
        IonList, IonItem, IonLabel,
        SmallItemContainer
    },
    setup(props: any) {
        const { filter } = toRefs(props)

        const store = useTasteBuddyStore();
        const recipes: ComputedRef<Recipe[]> = computed(() => store.getters.getRecipes);

        const filteredRecipe = ref(recipes.value);

        const handleFilter = () => {
            const query = filter.value.toLowerCase();
            filteredRecipe.value = recipes.value.filter(recipe => {
                const itemNames: string[] = getItemsFromRecipe(recipe).map(item => item.name.toLowerCase())
                return itemNames.includes(query)
            });
        }

        watch(recipes, () => {
            filteredRecipe.value = recipes.value;
        }, { immediate: true })

        return {
            getItemsFromRecipe, filteredRecipe,
            handleFilter,
            arrowDown
        };

    }
});
</script>

<style scoped>
.container {
    text-align: center;
    /*background-color: aquamarine;*/
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


.img-container {
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
