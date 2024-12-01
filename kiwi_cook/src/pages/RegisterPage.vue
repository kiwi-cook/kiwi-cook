<template>
    <q-page-container class="q-pa-md flex flex-center">
        <q-card class="q-pa-md q-my-xl q-mx-md register-card">
            <q-card-section class="text-center">
                <KiwiLogo />
                <div class="text-h6 q-mt-md">{{ $t('register.title') }}</div>
            </q-card-section>

            <!-- Username, Password, and Confirm Password Inputs -->
            <q-card-section>
                <input
v-model="username" :placeholder="$t('register.username')" outlined dense class="q-mb-md"
                    autocomplete="username" />
                <input
v-model="password" :placeholder="$t('register.password')" outlined dense type="password"
                    autocomplete="new-password" />
                <input
v-model="confirmPassword" :placeholder="$t('register.confirmPassword')" outlined dense
                    type="password" autocomplete="new-password" />
            </q-card-section>

            <!-- Action Buttons -->
            <q-card-actions align="center" class="q-pt-none">
                <q-btn color="primary" label="Register" class="full-width" @click="register" />
            </q-card-actions>

            <q-card-section class="text-center text-accent q-mt-md">
                <q-btn flat :label="$t('register.alreadyHaveAccount')" class="text-caption" />
            </q-card-section>
        </q-card>
    </q-page-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'stores/user-store';
import KiwiLogo from 'src/components/KiwiLogo.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const statusMessage = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const userStore = useUserStore();
const router = useRouter();

const register = () => {
  if (password.value !== confirmPassword.value) {
    statusMessage.value = t('register.passwordNotMatch');
    return;
  }

  userStore.register(username.value, password.value)
    .then(() => router.push('/login'))
    .catch(() => {
      // Handle registration error
    });
};
</script>

<style scoped>
.register-card {
    max-width: 400px;
    border-radius: 20px;
    padding: 12px 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s, box-shadow 0.2s;
}
</style>
