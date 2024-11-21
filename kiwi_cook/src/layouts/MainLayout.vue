<template>
  <q-layout :class="[{ 'bg-gradient-light': !isDark, 'bg-gradient-dark': isDark }]" view="hHh lpR fFf">
    <q-header :class="isDark ? 'bg-dark' : 'bg-primary'" reveal>
      <q-toolbar class="q-py-sm">
        <div class="row items-center cursor-pointer" @click="$router.push('/')">
          <div class="col">
            <div class="text-h4 text-weight-bold text-white q-mt-sm kiwi-title">KiwiCook <KiwiLogo/></div>
            <div :class="isDark ? 'text-secondary' : 'text-black'" class="kiwi-subtitle">{{ $t('app.tagline') }}</div>
          </div>
        </div>
        <q-space/>

        <!-- Login button -->
        <q-btn
          :color="isDark ? 'secondary' : 'white'"
          :text-color="isDark ? 'primary' : 'dark'"
          class="q-mr-md"
          flat
          @click="$router.push('/login')"
        >
          <q-icon name="mdi-login"/>
          <q-tooltip>Login</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container :class="isDark ? 'bg-dark-gradient' : 'bg-gradient'" class="page-container">
      <router-view v-slot="{ Component }">
        <transition mode="out-in" name="fade">
          <component :is="Component"/>
        </transition>
      </router-view>
    </q-page-container>

    <q-footer :class="{ 'bg-primary': !isDark, 'bg-dark': isDark }" class="footer">
      <q-toolbar>
        <q-btn :text-color="isDark ? 'white' : 'dark'" flat icon="mdi-github" @click="openGithub">
          <q-tooltip>Visit our GitHub</q-tooltip>
        </q-btn>
        <q-space/>
        <q-tabs
          v-model="tab"
          :class="isDark ? 'text-white' : 'text-black'"
        >
          <q-tab
            v-for="t in tabs"
            :key="t.name"
            :name="t.name"
            :icon="t.icon"
            :label="t.name"
            @click="t.click"
          />
        </q-tabs>
        <q-space/>
        <q-btn
          :color="isDark ? 'secondary' : 'white'"
          :icon="isDark ? 'wb_sunny' : 'nightlight_round'"
          :text-color="isDark ? 'primary' : 'dark'"
          class="q-ml-md mode-toggle"
          flat
          @click="toggleDarkMode"
        >
          <q-tooltip>{{ isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import KiwiLogo from 'components/KiwiLogo.vue';
import { useRouter } from 'vue-router';
import { useDarkMode } from 'src/composables/useDarkmode';

defineOptions({
  name: 'MainLayout',
});

/* Color mode toggle */

const { isDark, toggleDarkMode } = useDarkMode();

/* Link to GitHub */
const openGithub = () => window.open('https://github.com/kiwi-cook/kiwi-cook');

/* Tabs */
const router = useRouter();
const tabs = [
  {
    name: 'Chat',
    icon: 'chat',
    click: () => router.push({ name: 'chat' }),
  },
];
const tab = ref('chat');
watch(() => router.currentRoute.value.name, () => {
  switch (router.currentRoute.value.name) {
    case 'chat':
      tab.value = 'Chat';
      break;
    case 'settings':
      tab.value = 'Settings';
      break;
    case 'recipe':
      tab.value = 'Recipe';
      break;
    default:
      tab.value = '';
  }
}, { immediate: true });
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

body {
  font-family: 'Nunito', sans-serif;
}

body {
  font-size: 16px;

  @media screen and (min-width: 600px) {
    font-size: 18px;
  }

  @media screen and (min-width: 1280px) {
    font-size: 20px;
  }
}

.rounded-borders {
  border-radius: 24px;
}

.page {
  min-height: 100vh;
}

.page-container {
  height: 100%; // Fill available space
  padding: 0; // Remove padding to prevent double scrollbars
}

.q-page {
  height: 100%; // Ensure q-page fills the container
  padding: 0; // Remove default padding
  display: flex; // Enable flex layout
  flex-direction: column; // Stack children vertically
}

.mode-toggle {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.kiwi-title {
  font-family: 'Georgia', 'Times New Roman', serif;
}

.footer {
  font-size: 1em;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.body--dark {
  .q-page {
    color: #e0e0e0;
  }
}
</style>
