<template>
    <IonImg v-once :style="{ width: pixelSize, height: pixelSize }"
            class="taste-buddy-logo" src="./img/icon.png"/>
</template>

<script lang="ts" setup>
import {IonImg} from '@ionic/vue'
import {computed, PropType, toRefs} from "vue";

const props = defineProps({
    size: {
        type: String as PropType<'tiny' | 'small' | 'medium' | 'large'>,
        default: 'medium',
        required: false
    }
})
const {size} = toRefs(props)

const pixelSize = computed(() => {
    switch (size?.value ?? 'medium') {
        case 'tiny':
            return '50px'
        case 'small':
            return '100px'
        case 'medium':
            return '200px'
        case 'large':
            return '300px'
        default:
            return size?.value ?? '200px'
    }
})
</script>

<style>
.taste-buddy-logo {
    display: block;
    margin: 10px auto;
}


/* shadow root styles */
.taste-buddy-logo::part(image) {
    border-radius: var(--border-radius-round);
    box-shadow: var(--box-shadow);
}
</style>