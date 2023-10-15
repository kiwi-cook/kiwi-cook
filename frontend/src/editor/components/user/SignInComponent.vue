<template>
    <IonCard class="login-card">
        <IonCardHeader>
            <TasteBuddyLogo/>
        </IonCardHeader>
        <IonCardContent>
            <IonItem lines="none">
                <IonInput v-model="username" :clear-input="true" autocomplete="username" label="Username"
                          label-placement="floating" type="text"/>
            </IonItem>
            <IonItem lines="none">
                <IonInput v-model="password" :clear-input="true" :type="visible ? 'text' : 'password'" autocomplete="current-password"
                          label="Password" label-placement="floating"/>
                <IonCheckbox slot="end" v-model="visible" color="primary" label-placement="end">{{
                    $t('SignIn.ShowPassword')
                }}
                </IonCheckbox>
            </IonItem>
            <IonButton :disabled="isDisabled" expand="block" @click="authenticate()">
                {{ $t('SignIn.SignIn') }}
            </IonButton>
        </IonCardContent>
    </IonCard>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from 'vue';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCheckbox,
    IonInput,
    IonItem,
    useIonRouter
} from '@ionic/vue';
import TasteBuddyLogo from '@/app/components/TasteBuddyLogo.vue'
import {useTasteBuddyStore} from '@/editor/storage';
import {useRoute} from 'vue-router';

const store = useTasteBuddyStore();

const username = ref('');
const password = ref('');
const visible = ref(false);
const isDisabled = computed(() => username.value.length === 0 || password.value.length === 0)

const route = useRoute()
const router = useIonRouter()
const redirect = computed(() => (route.query.redirect ?? '') as string)

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
</script>

<style scoped>
.login-card {
    margin: var(--margin);
    /* max-width: 500px; */
    padding: var(--padding);
    text-align: center;
}
</style>
  