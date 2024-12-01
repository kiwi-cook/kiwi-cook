<template>
  <q-page-container class="q-pa-md flex flex-center">
    <q-card class="q-pa-md q-my-xl q-mx-md login-card">
      <q-card-section class="text-center">
        <KiwiLogo/>
        <div class="text-h6 q-mt-md">{{ $t('login.title') }}</div>
      </q-card-section>

      <!-- Username and Password Inputs -->
      <q-card-section>
        <q-input
          v-model="username"
          :placeholder="$t('login.username')"
          outlined
          dense
          class="q-mb-md"
        />
        <q-input
          v-model="password"
          :placeholder="$t('login.password')"
          outlined
          dense
          type="password"
        />
      </q-card-section>

      <!-- "Keep me signed in" checkbox -->
      <q-card-section>
        <q-checkbox v-model="keepSignedIn" :label="$t('login.keepSignedIn')" />
      </q-card-section>

      <!-- Action Buttons and Links -->
      <q-card-actions align="center" class="q-pt-none">
        <q-btn
          color="primary"
          label="Login"
          class="full-width"
          @click="login"
        />
      </q-card-actions>

      <q-card-section class="text-center text-accent q-mt-md">
        <q-btn flat :label="$t('login.signUp')" class="text-caption q-ml-md" to="/register"/>
      </q-card-section>
    </q-card>
  </q-page-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'stores/user-store';
import KiwiLogo from 'src/components/KiwiLogo.vue';

const password = ref('');
const username = ref('');
const keepSignedIn = ref(false);

const userStore = useUserStore();
const router = useRouter();

const login = () => {
  userStore.login(username.value, password.value)
    .then(() => router.push('/'))
    .catch(() => {
      // Handle login error
    });
};
</script>

<style scoped>
.login-card {
  max-width: 400px;
  border-radius: 20px;
  padding: 12px 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s, box-shadow 0.2s;
}
</style>
