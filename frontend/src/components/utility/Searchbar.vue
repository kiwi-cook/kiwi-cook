<template>
    <div class="searchbar-wrapper" @mouseenter="mouseLeave = false" @mouseleave="mouseLeave = true"
         @focusout="closeList()" @focusin="searchActive = true">
        <IonSearchbar v-model="searchInput" class="searchbar-search" :debounce="500"
                      :placeholder="placeholder" @keydown.esc="closeList()" @ionClear="closeList()" />
        <div v-show="listIsOpen" class="searchbar-list-wrapper">
            <div class="searchbar-list">
                <List :list="elements" :filter="searchInput" :loadAll="true" :noWrap="true" :horizontal="false">
                    <template #element="{element}">
                        <div @click="selectElement">
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
        const mouseLeave = ref(false)

        /**
         * Close list if mouse leaves searchbar and searchbar is not focussed
         * or on "esc" keydown
         */
        const closeList = () => {
            searchActive.value = !(mouseLeave.value)
        }
        /**
         * Close list if element was selected
         */
        const selectElement = () => {
            searchActive.value = false
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
            listIsOpen, mouseLeave, selectElement, closeList,
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
    margin: 0 auto;
    max-height: 30vh;
    overflow-y: scroll;
    background: var(--background);
    border: var(--border);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-strong);
}
</style>