<template>
    <IonPage>
        <IonTabs>
            <!-- Router views -->
            <IonRouterOutlet/>

            <IonProgressBar v-show="loadingState" type="indeterminate"/>
            <IonTabBar slot="bottom">
                <IonTabButton :disabled="loadingState" href="/recipe/of-the-day" tab="recipe-of-the-day">
                    <IonIcon :icon="home"/>
                    Home
                </IonTabButton>

                <IonTabButton :disabled="loadingState" href="/recipe/suggestions" tab="recipe-finder">
                    <IonIcon :icon="search"/>
                    Search
                </IonTabButton>

                <IonTabButton :disabled="loadingState" href="/recipe/saved" tab="saved-recipes">
                    <IonIcon :icon="star"/>
                    Favorites
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script lang="ts">
import {computed, defineComponent} from 'vue';
import {IonIcon, IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs,} from '@ionic/vue';
import {home, search, star} from 'ionicons/icons';
import {useRecipeStore} from '@/storage';

export default defineComponent({
    name: 'TabsPage',
    components: {IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet, IonProgressBar},
    setup() {

        // Check if the recipe store is loading
        const recipeStore = useRecipeStore()
        const loadingState = computed<boolean>(() => recipeStore.isLoading ?? false)

        return {
            loadingState,
            // icons
            home, search, star
        }
    }
});
</script>