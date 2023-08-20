<template>
    <div class="searchbar-wrapper">
        <IonSearchbar v-model="searchInput" :debounce="500" :placeholder="placeholder"
                      class="searchbar-search" @ionClear="searchInput = ''" @keydown.esc="closeSearch()"/>
        <div v-show="listIsOpen" class="searchbar-list-wrapper">
            <div class="searchbar-list">
                <List :horizontal="false" :list="elements" :loadAll="true" :noWrap="true">
                    <template #element="{element}">
                        <div @click="closeSearch()">
                            <slot :element="element" name="element">
                                {{ element }}
                            </slot>
                        </div>
                    </template>
                </List>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import {computed, defineComponent, ref, toRefs, watch} from "vue";
import {IonSearchbar} from "@ionic/vue";
import List from "@/components/recipe/List.vue";

export default defineComponent({
    name: 'Searchbar',
    props: {
        placeholder: {
            type: String,
            required: true
        },
        elements: {
            type: Array,
            required: true,
        },
    },
    components: {
        IonSearchbar,
        List
    },
    emits: ['update:modelValue'],
    setup(props, {emit}) {
        const {elements} = toRefs(props);

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


        /* State whether list should be open */
        const listIsOpen = computed<boolean>(() => {
            return elements.value.length !== 0 && (searchInput.value !== '' || searchActive.value)
        })

        watch(searchInput, (newFilterInput) => {
            // Emit new filter input
            emit('update:modelValue', newFilterInput)
        })

        return {
            listIsOpen, closeSearch,
            searchInput, searchActive,
        }
    }
})
</script>

<style scoped>
.searchbar-wrapper {
    width: 100%;
}

.searchbar-list-wrapper {
    position: absolute;
    left: 0;
    z-index: 10;
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