<template>
    <div class="searchbar-wrapper">
        <IonSearchbar v-model="searchInput" :debounce="100" :placeholder="placeholder"
                      class="searchbar-search" @ionClear="searchInput = ''" @keydown.esc="closeSearch()"/>
        <div v-show="listIsOpen" class="searchbar-list-wrapper">
            <div class="searchbar-list">
                <IonList class="ion-no-padding" lines="none">
                    <IonItemGroup v-if="recipes.length > 0">
                        <IonItemDivider>
                            <IonLabel>{{ $t('General.Recipe', recipes.length) }}</IonLabel>
                        </IonItemDivider>
                        <IonItem v-for="(recipe, recipeIndex) in recipes" :key="recipeIndex"
                                 class="link" @click="selectRecipe(recipe)">
                            {{ recipe.getName() }}
                        </IonItem>
                    </IonItemGroup>
                    <IonItemGroup v-if="tags.length > 0">
                        <IonItemDivider>
                            <IonLabel>{{ $t('General.Tag', tags.length) }}</IonLabel>
                        </IonItemDivider>
                        <IonItem class="over-x-scroll" lines="none">
                            <IonChip v-for="(tag, tagIndex) in tags" :key="tagIndex"
                                     class="link" @click="selectTag(tag)">
                                {{ tag }}
                            </IonChip>
                        </IonItem>
                    </IonItemGroup>
                    <IonItemGroup v-if="items.length > 0">
                        <IonItemDivider>
                            <IonLabel>{{ $t('General.Item', 2) }}</IonLabel>
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


<script lang="ts" setup>
import {computed, PropType, ref, toRefs, watch} from "vue";
import {IonChip, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonSearchbar} from "@ionic/vue";
import {Item, Recipe} from "@/shared";

// Props
const props = defineProps({
    placeholder: {
        type: String,
        required: true
    },
    tags: {
        type: Array as PropType<string[]>,
        required: false,
        default: () => []
    },
    recipes: {
        type: Array as PropType<Recipe[]>,
        required: false,
        default: () => []
    },
    items: {
        type: Array as PropType<Item[]>,
        required: false,
        default: () => []
    },
    disableList: {
        type: Boolean,
        required: false,
        default: false
    }
})
const {tags, recipes, items, disableList} = toRefs(props);

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

/* State whether list should be open */
const listIsOpen = computed<boolean>(() => {
    return (items.value.length > 0 && tags.value.length > 0 || recipes.value.length > 0) && (searchInput.value !== '' || searchActive.value) && !disableList.value
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