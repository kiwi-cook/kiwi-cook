<template>
    <ion-page>
        <ion-tabs>
            <!-- Router views -->
            <ion-router-outlet />

            <ion-progress-bar type="indeterminate" v-if="loadingState" />
            <ion-tab-bar slot="bottom">
                <ion-tab-button href="/recipe/of-the-day" tab="recipe-of-the-day">
                    <ion-icon :icon="fastFood" />
                    <ion-label>Today</ion-label>
                </ion-tab-button>

                <ion-tab-button href="/recipe/suggestions" tab="recipe-finder">
                    <ion-icon :icon="sparklesOutline" />
                    <ion-label>Suggestions</ion-label>
                </ion-tab-button>

                <ion-tab-button href="/recipe/saved" tab="saved-recipes">
                    <ion-icon :icon="heart" />
                    <ion-label>Saved</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonIcon, IonLabel, IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, } from '@ionic/vue';
import { fastFood, heart, sparklesOutline } from 'ionicons/icons';
import { useTasteBuddyStore } from '@/storage';
import { computed } from 'vue';

export default defineComponent({
    name: 'TabsPage',
    components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet, IonProgressBar },
    setup() {

        const store = useTasteBuddyStore()
        const loadingState = computed(() => store.getters.isLoading ?? false)

        return {
            loadingState,
            // icons
            heart, fastFood, sparklesOutline
        }
    }
});
</script>