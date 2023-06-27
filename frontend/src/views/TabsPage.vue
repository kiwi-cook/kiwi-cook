<template>
    <IonPage>
        <IonTabs>
            <!-- Router views -->
            <IonRouterOutlet/>

            <IonProgressBar v-if="loadingState" type="indeterminate"/>
            <IonTabBar slot="bottom">
                <IonTabButton href="/recipe/of-the-day" tab="recipe-of-the-day">
                    <IonIcon :icon="fastFood"/>
                    <IonLabel>Today</IonLabel>
                </IonTabButton>

                <IonTabButton href="/recipe/suggestions" tab="recipe-finder">
                    <IonIcon :icon="sparklesOutline"/>
                    <IonLabel>Suggestions</IonLabel>
                </IonTabButton>

                <IonTabButton href="/recipe/saved" tab="saved-recipes">
                    <IonIcon :icon="heart"/>
                    <IonLabel>Saved</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script lang="ts">
import {computed, defineComponent} from 'vue';
import {
    IonIcon,
    IonLabel,
    IonPage,
    IonProgressBar,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
} from '@ionic/vue';
import {fastFood, heart, sparklesOutline} from 'ionicons/icons';
import {useTasteBuddyStore} from '@/storage';

export default defineComponent({
    name: 'TabsPage',
    components: {IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet, IonProgressBar},
    setup() {

        const store = useTasteBuddyStore()
        const loadingState = computed(() => store.isLoading ?? false)

        return {
            loadingState,
            // icons
            heart, fastFood, sparklesOutline
        }
    }
});
</script>