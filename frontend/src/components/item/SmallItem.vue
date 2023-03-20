<template>
    <ion-item lines="none" class="small-item">
        <ion-img :src="itemImgUrl" class="small-item-img"/>
        <ion-text color="light" class="small-item-name">{{ itemName }}</ion-text>
    </ion-item>
</template>

<script lang="ts">
import {Item, StepItem} from '@/api/types';
import {IonImg, IonItem} from '@ionic/vue';
import {computed, defineComponent, PropType, toRefs} from 'vue';

export default defineComponent({
    name: 'SmallRecipe',
    props: {
        item: {
            type: Object as PropType<Item | StepItem>,
            required: true,
        },
    },
    components: {
        IonItem, IonImg
    },
    setup(props: any) {
        const {item} = toRefs(props);
        const itemImgUrl = computed(() => item.value instanceof StepItem ? item.value?.item.imgUrl : item.value?.imgUrl);
        const itemName = computed(() => {
            const name = item.value instanceof StepItem ? item.value?.item.name : item.value?.name
            const amount = item.value instanceof StepItem ? item.value?.amount : 0
            const unit = item.value instanceof StepItem ? item.value?.unit : ''
            return `${name} ${amount > 1 ? `(${amount} ${unit})` : ''}`
        });
        return {
            itemName, itemImgUrl
        }
    }
});
</script>

<style scoped>
.small-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    margin: 0;
    background: inherit !important;
}

.small-item-img::part(image) {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
}

ion-text.small-item-name {
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0;
}
</style>