<template>
    <ion-card class="login-card">
        <ion-card-header>
            <TasteBuddyLogo/>
        </ion-card-header>
        <ion-card-content>
            <ion-item>
                <ion-input v-model="username" label="Username" label-placement="floating" type="text"
                           autocomplete="username" :clear-input="true"/>
            </ion-item>
            <ion-item>
                <ion-input v-model="password" label="Password" label-placement="floating"
                           autocomplete="current-password" type="password"/>
            </ion-item>
            <ion-button expand="block" @click="authenticate()" :disabled="isDisabled">Login</ion-button>
            <p class="signup-link">Don't have an account?
                <router-link to="/register">Sign up</router-link>
            </p>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {computed, ref, watch} from 'vue';
import {IonButton, IonCard, IonCardContent, IonCardHeader, IonInput, IonItem} from '@ionic/vue';
import TasteBuddyLogo from '@/components/general/TasteBuddyLogo.vue'
import {useTasteBuddyStore} from '@/storage';
import {useRoute, useRouter} from 'vue-router';

export default {
    name: 'Login',
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
        const router = useRouter()
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
  