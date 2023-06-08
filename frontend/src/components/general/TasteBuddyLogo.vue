<template>
    <ion-img :style="{ width: pixelSize, height: pixelSize }" :class="['taste-buddy-logo', { 'margin': withLeftMargin}]" src="./img/icon.png"/>
</template>

<script lang="ts">
import {IonImg} from '@ionic/vue'
import {computed, toRefs} from "vue";

export default {
    name: 'TasteBuddyLogo',
    props: {
        size: {
            type: String,
            default: '200px',
            required: false
        },
        withLeftMargin: {
            type: Boolean,
            required: false
        }
    },
    components: {
        IonImg
    },
    setup(props: { size?: string }) {
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

        return {
            pixelSize,
        }
    }
}
</script>

<style>
.taste-buddy-logo {
    display: block;
    margin: 10px auto;
}

.taste-buddy-logo.left-margin {
    margin-left: 5px;
}

.taste-buddy-logo.margin {
    margin: 5px;
}



/* shadow root styles */
.taste-buddy-logo::part(image) {
    border-radius: 50px;
}
</style>