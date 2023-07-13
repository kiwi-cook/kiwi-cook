<template>
    <IonCard>
        <IonCardHeader>
            <IonItem lines="none">
                <IonAvatar v-if="mutableItem.imgUrl">
                    <img :alt="`Image of ${mutableItem.name}`" :src="mutableItem.imgUrl"/>
                </IonAvatar>
                <IonChip>
                    {{ mutableItem.getId() }}
                </IonChip>
                <IonButton @click="saveItem()">Save item</IonButton>
            </IonItem>
            <IonCardTitle color="primary">
                <IonItem lines="none">
                    <div slot="start">
                        <IonInput :maxlength="40" :value="mutableItem.name" label="Name" label-placement="stacked"
                                  placeholder="e.g. Baking powder" type="text"
                                  @keyup.enter="mutableItem.name = $event.target.value"
                                  @ion-blur="mutableItem.name = ($event.target.value ?? '').toString()"/>
                    </div>
                    <div slot="end">
                        <IonButton color="danger" fill="solid" @click="removeItem()">
                            Delete item
                        </IonButton>
                    </div>
                </IonItem>

                <IonItem lines="none">
                    <IonInput v-model="mutableItem.imgUrl" label="Image URL" label-placement="stacked" type="text"/>
                </IonItem>

                <IonItem lines="none">
                    <IonSelect v-model="mutableItem.type" label="Type" label-placement="stacked" placeholder="Type">
                        <IonSelectOption value="ingredient">Ingredient</IonSelectOption>
                        <IonSelectOption value="tool">Tool</IonSelectOption>
                    </IonSelect>
                </IonItem>
            </IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
            Used in {{ usedInRecipes.length }} recipes
            <template v-if="usedInRecipes.length > 0">
                <IonList>
                    <template v-for="(recipe, index) in usedInRecipes" :key="index">
                        <router-link :to="recipe.route()">
                            <IonChip>
                                {{ recipe?.name }}
                            </IonChip>
                        </router-link>
                    </template>
                </IonList>
            </template>
        </IonCardContent>
    </IonCard>
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


        const usedInRecipes: ComputedRef<Recipe[]> = computed(() => {
            const recipesByItemIds = store.getRecipesByItemIds
            if (!recipesByItemIds || !item.value || !(item.value.getId() in recipesByItemIds)) {
                return []
            }
            return recipesByItemIds[item.value?.getId() ?? '']
                .map((recipeId: string) => store.getRecipesAsMap[recipeId])
        })

        const saveItem = () => mutableItem.value.save(store)
        const deleteItem = () => mutableItem.value.delete()

        return {
            mutableItem, saveItem, removeItem: deleteItem,
            usedInRecipes
        }
    }
})
</script>