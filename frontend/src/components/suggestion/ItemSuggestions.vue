<template>
    <IonList>
        <IonItem v-for="item in itemsWithImgUrl" :key="item.getId()" class="suggested-item"
                 @click="select(item.getId())">
            <IonThumbnail v-if="item.imgUrl !== ''" slot="start">
                <img :alt="`Image of ${item.name}`" :src="item.imgUrl"/>
            </IonThumbnail>
            <IonLabel>{{ item.name }}</IonLabel>
        </IonItem>
    </IonList>
</template>

<script lang="ts">
import {Item} from '@/tastebuddy/types';
import {IonItem, IonLabel, IonList, IonThumbnail} from '@ionic/vue';
import {computed, defineComponent, PropType, toRefs} from 'vue';

export default defineComponent({
    name: 'ItemSuggestions',
    props: {
        items: {
            type: Object as PropType<Item[]>,
            required: true
        }
    },
    components: {
        IonList, IonThumbnail, IonLabel, IonItem
    },
    emits: ['select'],
    setup(props: { items: Item[] }, {emit}) {
        const {items} = toRefs(props)
        const itemsWithImgUrl = computed(() => items.value.filter((item: Item) => (item.imgUrl ?? '') !== ''))

        const select = (itemID: string) => {
            emit('select', itemID)
        }

        return {
            itemsWithImgUrl,
            select
        }
    }
})
</script>

<style scoped>
.suggested-item {
    display: flex;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
    cursor: pointer;
}
</style>