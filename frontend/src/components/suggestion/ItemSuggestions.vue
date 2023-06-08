<template>
    <!-- Show multiple images of items using ionic -->
    <div class="image-container">
        <div class="image-wrapper" v-for="item in itemsWithImgUrl" :key="item._id" @click="select(item.getId())">
            <ion-card>
                <ion-img :src="item.imgUrl" class="image" />
                <ion-card-header>
                    <ion-card-title color="light">{{ item.name }}</ion-card-title>
                    <ion-card-subtitle>{{ item.type }}</ion-card-subtitle>
                </ion-card-header>
            </ion-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Item } from '@/tastebuddy/types';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonImg } from '@ionic/vue';
import { PropType, computed, defineComponent, toRefs } from 'vue';

export default defineComponent({
    name: 'ItemSuggestions',
    props: {
        items: {
            type: Object as PropType<Item[]>,
            required: true
        }
    },
    components: {
        IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonImg
    },
    emits: ['select'],
    setup(props: { items: Item[] }, { emit }) {
        const { items } = toRefs(props)
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
.image-container {
    display: flex;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
    cursor: pointer;
}

.image-wrapper {
    flex-shrink: 0;
    max-width: 200px;
    margin: 0 5px;
    position: relative;
}

.image {
    width: 100px;
    height: auto;
    object-fit: cover;
}

.image-title {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 14px;
    text-align: center;
}
</style>