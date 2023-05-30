<template>
    <ion-card>
        <ion-card-header>
            <ion-item v-if="mutableItem.imgUrl || mutableItem._id" lines="none">
                <ion-avatar v-if="mutableItem.imgUrl">
                    <img :alt="`Image of ${mutableItem.name}`" :src="mutableItem.imgUrl"/>
                </ion-avatar>
                <ion-chip v-if="mutableItem._id" color="light">
                    {{ mutableItem._id }}
                </ion-chip>
            </ion-item>
            <ion-card-title color="primary">
                <ion-item lines="none">
                    <div slot="start">
                        <ion-input :maxlength="40" :value="mutableItem.name"
                                   label="Name"
                                   label-placement="floating" placeholder="e.g. Baking powder"
                                   type="text" @keyup.enter="mutableItem.name = $event.target.value"
                                   @ion-blur="mutableItem.name = ($event.target.value ?? '').toString()"/>
                    </div>
                    <div slot="end">
                        <ion-button color="danger" fill="solid" @click="removeItem()">
                            Delete item
                        </ion-button>
                    </div>
                </ion-item>

                <ion-item lines="none">
                    <ion-input v-model="mutableItem.imgUrl" label="Image URL" label-placement="floating" type="text"/>
                </ion-item>

                <ion-item lines="none">
                    <ion-select v-model="mutableItem.type" label="Type" label-placement="floating" placeholder="Type">
                        <ion-select-option value="ingredient">Ingredient</ion-select-option>
                        <ion-select-option value="tool">Tool</ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-card-title>
        </ion-card-header>

        <ion-card-content>
            <template v-if="usedInRecipes.length > 0">
                Used in recipes:
                <ion-list>
                    <template v-for="(recipe, index) in usedInRecipes" :key="index">
                        <ion-chip>
                            {{ recipe?.name }}
                        </ion-chip>
                    </template>
                </ion-list>
            </template>
        </ion-card-content>
    </ion-card>

    <ion-item>
        <ion-button @click="saveItem()">Save item</ion-button>
    </ion-item>
</template>

<script lang="ts">
import {Item, Recipe} from '@/tastebuddy/types';
import {
    IonAvatar,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonInput,
    IonItem,
    IonList,
    IonSelect,
    IonSelectOption
} from '@ionic/vue';
import {computed, ComputedRef, defineComponent, PropType, Ref, ref, toRefs, watch} from 'vue';
import {useTasteBuddyStore} from '@/storage';

export default defineComponent({
    name: 'ItemEditor',
    props: {
        item: {
            type: Object as PropType<Item>,
            required: true
        }
    },
    components: {
        IonSelect,
        IonSelectOption,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonItem,
        IonList,
        IonInput,
        IonChip,
        IonAvatar,
        IonButton
    },
    emits: ['remove'],
    setup(props) {
        const {item} = toRefs(props)
        const store = useTasteBuddyStore()

        const mutableItem: Ref<Item> = ref(item.value)

        // update mutableItem when item changes
        watch(item, () => {
            mutableItem.value = item.value
        })

        const usedInRecipes: ComputedRef<Recipe[]> = computed(() => store.getters.getRecipesByItemId(item.value._id)
            .map((recipeId: string) => store.getters.getRecipesById[recipeId]))

        const saveItem = () => mutableItem.value.save(store)
        const deleteItem = () => mutableItem.value.delete(store)

        return {
            mutableItem, saveItem, removeItem: deleteItem,
            usedInRecipes
        }
    }
})
</script>