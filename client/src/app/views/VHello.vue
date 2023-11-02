<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <div class="vertical-center">
                        <HeaderTyped :big-text="['Welcome', `to ${APP_NAME}`]" :speed="30"
                                     @finish="finished = true"/>
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {IonContent, IonPage, useIonRouter} from '@ionic/vue';
import HeaderTyped from '@/shared/components/utility/header/HeaderTyped.vue';
import {APP_NAME} from '@/shared/ts';
import {useRecipeStore} from '@/app/storage';
import {computed, onUnmounted, ref, watch} from 'vue';

const finished = ref(false)
const router = useIonRouter()
const recipeStore = useRecipeStore()
const isLoadingInitialData = computed(() => recipeStore.isLoadingInitial)
const timeout = ref(0)
watch([isLoadingInitialData, finished], () => {
    if (!isLoadingInitialData.value && finished.value) {
        timeout.value = setTimeout(() => {
            router.replace({name: 'Home'})
        }, 1000)
    }
}, {immediate: true})

onUnmounted(() => {
    clearTimeout(timeout.value)
})
</script>