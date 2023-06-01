<template>
    <ion-card class="login-card">
        <ion-card-header>
            <TasteBuddyLogo />
        </ion-card-header>
        <ion-card-content>
            <ion-item>
                <ion-input v-model="username" :clear-input="true" autocomplete="username" label="Username"
                    label-placement="floating" type="text" />
            </ion-item>
            <ion-item>
                <ion-input v-model="password" autocomplete="current-password" label="Password" label-placement="floating"
                    type="password" />
            </ion-item>
            <ion-button :disabled="isDisabled" expand="block" @click="authenticate()">Sign in</ion-button>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { computed, ref, watch } from 'vue';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonInput, IonItem } from '@ionic/vue';
import TasteBuddyLogo from '@/components/general/TasteBuddyLogo.vue'
import { useTasteBuddyStore } from '@/storage';
import { useRoute } from 'vue-router';
import { useIonRouter } from '@ionic/vue';

export default {
    name: 'SignIn',
    components: {
        IonButton,
        IonCard,
        IonCardContent,
        IonCardHeader,
        IonInput,
        IonItem,
        TasteBuddyLogo,
    },
    setup() {
        const username = ref('');
        const password = ref('');
        const isDisabled = computed(() => username.value.length === 0 || password.value.length === 0)

        const route = useRoute()
        const router = useIonRouter()
        const redirect = computed(() => (route.query.redirect ?? '') as string)

        const store = useTasteBuddyStore();
        const isAuthenticated = computed(() => store.getters.isAuthenticated)
        /* Redirect if already logged in */
        watch(isAuthenticated, () => {
            if (isAuthenticated.value) {
                router.push(redirect.value)
            }
        })

        /* Login */
        const authenticate = () => {
            store.dispatch('basicAuth', {
                username: username.value,
                password: password.value,
            }).then((success: boolean) => {
                if (success) {
                    router.push(redirect.value)
                }
            })
        }


        return {
            username, password,
            isDisabled,
            authenticate,
        };
    },
};
</script>

<style scoped>
.login-card {
    margin: 32px;
    /* max-width: 500px; */
    padding: 16px;
    text-align: center;
}

.signup-link {
    margin-top: 16px;
}
</style>
  