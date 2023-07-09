<template>
    <IonPage>
        <IonTabs>
            <!-- Router views -->
            <IonRouterOutlet/>

            <IonProgressBar v-show="loadingState" type="indeterminate"/>
            <IonTabBar slot="bottom">
                <IonTabButton href="/recipe/of-the-day" tab="recipe-of-the-day">
                    <IonIcon :icon="home"/>
                </IonTabButton>

                <IonTabButton href="/recipe/suggestions" tab="recipe-finder">
                    <IonIcon :icon="search"/>
                </IonTabButton>

                <IonTabButton href="/recipe/saved" tab="saved-recipes">
                    <IonIcon :icon="star"/>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script lang="ts">
import {computed, defineComponent} from 'vue';
import {IonIcon, IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs,} from '@ionic/vue';
import {home, search, star} from 'ionicons/icons';
import {useTasteBuddyStore} from '@/storage';

export default defineComponent({
    name: 'TabsPage',
    components: {IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet, IonProgressBar},
    setup() {

        const store = useTasteBuddyStore()
        const loadingState = computed(() => store.isLoading ?? false)

        return {
            loadingState,
            // icons
            home, search, star
        }
    }
});
</script>