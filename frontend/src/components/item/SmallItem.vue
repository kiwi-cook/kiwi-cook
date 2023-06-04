<template>
    <ion-item class="small-item" lines="none">
        <ion-img :src="itemImgUrl ?? ''" class="small-item-img" />
        <ion-text class="small-item-name">
            <ion-chip v-if="itemAmountUnit !== ''" color="light">
                {{ itemAmountUnit }}</ion-chip>{{ itemName }}
        </ion-text>
    </ion-item>
</template>

<script lang="ts">
import { Item, StepItem } from '@/tastebuddy/types';
import { IonChip, IonImg, IonItem, IonText } from '@ionic/vue';
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
        const itemImgUrl = computed(() => item.value instanceof StepItem ? item.value?.imgUrl : (item.value as Item)?.imgUrl);
        const itemName = computed(() => item.value instanceof StepItem ? item.value?.name : (item.value as Item)?.name);
        const itemAmountUnit = computed(() => {
            if (item.value.type === 'ingredient') {
                const amount = item.value instanceof StepItem ? item.value?.amount : 0
                const unit = item.value instanceof StepItem ? item.value?.unit : ''
                return amount > 0 ? `${amount} ${unit}` : ''
            }
            return ''
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
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
}

ion-text.small-item-name {
    font-size: 1rem;
    margin: 0;
}
</style>