<template>
    <IonPage id="recipe-detail-page">
        <IonHeader>
            <IonToolbar color="primary">
                <IonTitle>{{ recipe?.name }}</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <div class="content">
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">{{ recipe?.name }}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <template v-if="recipe">
                    <RecipeComponent :recipe="recipe"/>
                </template>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton color="tertiary" size="small">
                    <IonIcon :icon="addOutline"/>
                </IonFabButton>
                <IonFabList side="end">
                    <IonFabButton color="primary" @click="goBack()">
                        <IonIcon :icon="arrowBack"/>
                    </IonFabButton>
                    <IonFabButton v-if="isDevMode" color="primary" @click="editRecipe()">
                        <IonIcon :icon="createOutline"/>
                    </IonFabButton>
                </IonFabList>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent} from 'vue';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonFabList,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonRouter
} from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import {useTasteBuddyStore} from "@/storage";
import {useRoute} from 'vue-router';
import {Recipe} from '@/tastebuddy/types';
import {addOutline, arrowBack, createOutline} from "ionicons/icons";


export default defineComponent({
    title: 'RecipeOfTheDayPage',
    components: {
        RecipeComponent,
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonFabButton, IonIcon, IonFab, IonFabList,
    },
    setup() {
        const route = useRoute()
        const recipeId: ComputedRef<string> = computed(() => (route.params.id ?? '') as string)

        const store = useTasteBuddyStore()
        const recipe: ComputedRef<Recipe> = computed(() => store.getRecipesAsMap[recipeId.value])
        const isDevMode = computed(() => store.isDevMode)
        const editRecipe = () => {
            if (isDevMode.value) {
                router.push({name: 'RecipeEditor', params: {id: recipeId.value}})
            }
        }


        const router = useIonRouter()
        const goBack = () => router.back()

        return {
            // recipe
            recipe, isDevMode, editRecipe, createOutline,
            // fab
            goBack, arrowBack, addOutline
        }
    }
});
</script>

<style scoped>
.gradient {
    background: linear-gradient(to bottom, #2F3540 0%, rgba(0, 0, 0, 0) 100%);
}
</style>