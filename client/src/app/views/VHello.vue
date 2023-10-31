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
import {IonContent, IonPage, useIonRouter} from "@ionic/vue";
import HeaderTyped from "@/shared/components/utility/header/HeaderTyped.vue";
import {APP_NAME} from "@/shared/ts";
import {useRecipeStore} from "@/app/storage";
import {computed, ref, watch} from "vue";

const finished = ref(false)
const router = useIonRouter()
const recipeStore = useRecipeStore()
const isLoadingInitialData = computed(() => recipeStore.isLoadingInitial)
watch([isLoadingInitialData, finished], () => {
    if (!isLoadingInitialData.value && finished.value) {
        setTimeout(() => {
            router.replace({name: 'Home'})
        }, 1000)
    }
})
</script>