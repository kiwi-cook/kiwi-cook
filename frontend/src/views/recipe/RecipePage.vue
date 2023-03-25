<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>{{ recipe?.name }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="gradient">
                <div class="content">
                    <ion-header collapse="condense">
                        <ion-toolbar>
                            <ion-title size="large">{{ recipe?.name }}</ion-title>
                        </ion-toolbar>
                    </ion-header>
                    <RecipeComponent :recipe="recipe" />
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import RecipeComponent from "@/components/recipe/Recipe.vue";
import { useRoute } from "vue-router";
import { useTasteBuddyStore } from "@/storage";

export default defineComponent({
    title: 'RecipePage',
    components: {
        RecipeComponent,
        IonPage, IonContent, IonHeader, IonToolbar, IonTitle
    },
    setup() {
        const route = useRoute()

        const id = computed(() => (route.params.id ?? '') as string)
        const store = useTasteBuddyStore()
        const recipe = computed(() => store.getters.getRecipesById[id.value])
        return {
            recipe
        }
    }
});

</script>