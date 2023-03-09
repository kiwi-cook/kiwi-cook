<template>
    <ion-card>
        <ion-card-header>
            <ion-item lines="none">
                <ion-avatar v-if="mutableItem.imgUrl">
                    <img :src="mutableItem.imgUrl" />
                </ion-avatar>
                <ion-chip color="light" v-if="mutableItem._id">
                    {{ mutableItem._id }}
                </ion-chip>
            </ion-item>
            <ion-card-title color="primary">
                <ion-item lines="none">
                    <div slot="start">
                        <ion-label color="light" position="stacked">Name</ion-label>
                        <ion-input v-model="mutableItem.name" placeholder="Item name" color="light"></ion-input>
                    </div>
                    <div slot="end">
                        <ion-button fill="solid" color="danger" @click="removeItem()">
                            Remove item
                        </ion-button>
                    </div>
                </ion-item>
            </ion-card-title>
        </ion-card-header>

        <ion-card-content>
            Used in recipes:
            <ion-list>
                <template v-for="(recipe, index) in usedInRecipes" :key="index">
                    <ion-chip color="light">
                        {{ recipe.name }}
                    </ion-chip>
                </template>
            </ion-list>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { Item, Recipe } from '@/api/types';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonList, IonLabel, IonInput, IonChip, IonAvatar } from '@ionic/vue';
import { computed, ComputedRef, defineComponent, PropType, Ref, ref, toRefs, watch } from 'vue';
import { useTasteBuddyStore } from '@/storage';
import { getFromAPI } from '@/api';
import { API_ROUTE } from '@/api/constants';

export default defineComponent({
    name: 'ItemEditor',
    props: {
        item: {
            type: Object as PropType<Item>,
            required: true
        }
    },
    components: {
        IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonList, IonLabel, IonInput, IonChip, IonAvatar,
    },
    setup(props) {
        const { item } = toRefs(props)
        const store = useTasteBuddyStore()

        const mutableItem: Ref<Item> = ref(item)

        // update mutableItem when item changes
        watch(item, () => {
            mutableItem.value = item.value
        })

        const usedInRecipes = computed(() => store.getters.getRecipesByItemId(mutableItem.value._id)
            .map((recipeId: string) => store.getters.getRecipesById[recipeId]))

        const removeItem = () => {
            getFromAPI(API_ROUTE.DELETE_ITEM, { formatObject: { ITEM_ID: mutableItem.value._id ?? '' }})
        }

        return {
            mutableItem, removeItem,
            usedInRecipes
        }
    }
})
</script>