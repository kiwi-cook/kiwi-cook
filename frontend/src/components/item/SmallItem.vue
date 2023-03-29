<template>
    <ion-item lines="none" class="small-item">
        <ion-img :src="itemImgUrl ?? ''" class="small-item-img" />
        <ion-text class="small-item-name">{{ itemName }}</ion-text>
        <ion-chip v-if="itemAmountUnit !== ''">{{ itemAmountUnit }}</ion-chip>
    </ion-item>
</template>

<script lang="ts">
import { Item, StepItem } from '@/api/types';
import { IonImg, IonItem, IonText, IonChip } from '@ionic/vue';
import { computed, defineComponent, PropType, toRefs } from 'vue';

export default defineComponent({
    name: 'SmallRecipe',
    props: {
        item: {
            type: Object as PropType<Item | StepItem>,
            required: true,
        },
    },
    components: {
        IonItem, IonImg, IonText, IonChip
    },
    setup(props: any) {
        const { item } = toRefs(props);
        const itemImgUrl = computed(() => item.value instanceof StepItem ? item.value?.item.imgUrl : (item.value as Item)?.imgUrl);
        const itemName = computed(() => item.value instanceof StepItem ? item.value?.item.name : (item.value as Item)?.name);
        const itemAmountUnit = computed(() => {
            const amount = item.value instanceof StepItem ? item.value?.amount : 0
            const unit = item.value instanceof StepItem ? item.value?.unit : ''
            return amount > 1 ? `${amount} ${unit}` : ''
        })
        return {
            itemName, itemAmountUnit, itemImgUrl
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