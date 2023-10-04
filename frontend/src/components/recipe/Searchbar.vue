<template>
    <div class="searchbar-wrapper">
        <IonSearchbar v-model="searchInput" :debounce="100" :placeholder="placeholder"
                      class="searchbar-search" @ionClear="searchInput = ''" @keydown.esc="closeSearch()"/>
        <div v-show="listIsOpen" class="searchbar-list-wrapper">
            <div class="searchbar-list">
                <IonList lines="none" class="ion-no-padding">
                    <IonItemGroup v-if="recipes.length > 0">
                        <IonItemDivider>
                            <IonLabel>{{$t('General.Recipe', 2)}}</IonLabel>
                        </IonItemDivider>
                        <IonItem v-for="(recipe, recipeIndex) in recipes" :key="recipeIndex"
                                 class="link" @click="selectRecipe(recipe)">
                            {{ recipe.getName() }}
                        </IonItem>
                    </IonItemGroup>
                    <IonItemGroup v-if="tags.length > 0">
                        <IonItemDivider>
                            <IonLabel>{{$t('General.Tag', 2)}}</IonLabel>
                        </IonItemDivider>
                        <IonItem lines="none" class="over-x-scroll">
                            <IonChip v-for="(tag, tagIndex) in tags" :key="tagIndex"
                                     class="link" @click="selectTag(tag)">
                                {{ tag }}
                            </IonChip>
                        </IonItem>
                    </IonItemGroup>
                    <IonItemGroup v-if="items.length > 0">
                        <IonItemDivider>
                            <IonLabel>{{$t('General.Item', 2)}}</IonLabel>
                        </IonItemDivider>
                        <IonItem v-for="(item, itemIndex) in items" :key="itemIndex"
                                 class="link" @click="selectItem(item)">
                            {{ item.getName() }}
                        </IonItem>
                    </IonItemGroup>
                </IonList>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import {computed, PropType, ref, toRefs, watch} from "vue";
import {IonChip, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonSearchbar} from "@ionic/vue";
import {Item, Recipe} from "@/tastebuddy";

// Props
const props = defineProps({
    placeholder: {
        type: String,
        required: true
    },
    elements: {
        type: Object as PropType<(Item | Recipe | string)[]>,
        required: true,
    },
    disableList: {
        type: Boolean,
        required: false,
        default: false
    }
})
const {elements, disableList} = toRefs(props);

// Emits
const emit = defineEmits({
    'update:modelValue': (value: string) => value,
    'selectTag': (tag: string) => tag,
    'selectRecipe': (recipe: Recipe) => recipe,
    'selectItem': (item: Item) => item,
})

/* Searchbar state */
const searchActive = ref(false)
const searchInput = ref('')

/**
 * Close list if mouse leaves searchbar and searchbar is not focussed
 * or on "esc" keydown
 */
const closeSearch = () => {
    searchInput.value = ''
}

const selectTag = (tag: string) => {
    emit('selectTag', tag)
    closeSearch()
}

/**
 * Select recipe and close list
 */
const selectRecipe = (recipe: Recipe) => {
    emit('selectRecipe', recipe)
    closeSearch()
}

/**
 * Select item and close list
 */
const selectItem = (item: Item) => {
    emit('selectItem', item)
    closeSearch()
}


/**
 * Create sublists that are differentiated by their type.
 * E.g. all items are in one list and all recipes in another.
 */
const tags = computed<string[]>(() => elements.value
    .filter((element) => typeof element === 'string' || element instanceof String) as string[])
const recipes = computed<Recipe[]>(() => elements.value.filter((element) => element instanceof Recipe) as Recipe[])
const items = computed<Item[]>(() => elements.value.filter((element) => element instanceof Item) as Item[])

/* State whether list should be open */
const listIsOpen = computed<boolean>(() => {
    return elements.value.length !== 0 && (searchInput.value !== '' || searchActive.value) && !disableList.value
})

watch(searchInput, (newFilterInput) => {
    // Emit new filter input
    emit('update:modelValue', newFilterInput)
})
</script>

<style scoped>
.searchbar-wrapper {
    width: 100%;
}

.searchbar-list-wrapper {
    position: absolute;
    left: 0;
    z-index: 110;
    width: 100%;
}

.searchbar-list {
    width: 90%;
    max-width: var(--max-width);
    margin: var(--margin-auto);
    max-height: 30vh;
    overflow-y: scroll;
    padding: var(--padding-large);
    background: var(--background);
    border: var(--border);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-strong);
}
</style>