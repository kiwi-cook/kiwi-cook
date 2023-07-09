<template>
    <IonCard class="login-card">
        <IonCardHeader>
            <TasteBuddyLogo/>
        </IonCardHeader>
        <IonCardContent>
            <IonItem>
                <IonInput v-model="username" :clear-input="true" autocomplete="username" label="Username"
                          label-placement="floating" type="text"/>
            </IonItem>
            <IonItem>
                <IonInput v-model="password" autocomplete="current-password" label="Password"
                          label-placement="floating"
                          type="password"/>
            </IonItem>
            <IonButton :disabled="isDisabled" expand="block" @click="authenticate()">Sign in</IonButton>
        </IonCardContent>
    </IonCard>
</template>

<script lang="ts">
import {computed, ref, watch} from 'vue';
import {IonButton, IonCard, IonCardContent, IonCardHeader, IonInput, IonItem, useIonRouter} from '@ionic/vue';
import TasteBuddyLogo from '@/components/TasteBuddyLogo.vue'
import {useUserStore} from '@/storage';
import {useRoute} from 'vue-router';

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

        const store = useUserStore();
        const isAuthenticated = computed(() => store.isAuthenticated)
        /* Redirect if already logged in */
        watch(isAuthenticated, () => {
            if (isAuthenticated.value) {
                router.push(redirect.value)
            }
        })

        /* Login */
        const authenticate = () => {
            store.basicAuth({
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
  