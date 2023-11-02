<template>
    <IonApp>
        <IonRouterOutlet/>
    </IonApp>
</template>

<script lang="ts" setup>
import {IonApp, IonRouterOutlet} from '@ionic/vue';
import {useRecipeStore} from '@/editor/storage';

const recipeStore = useRecipeStore()
recipeStore.prepare()
</script>