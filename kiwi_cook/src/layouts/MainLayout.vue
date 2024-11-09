<template>
  <q-layout :class="[{ 'bg-gradient-light': !isDark, 'bg-gradient-dark': isDark }]" view="hHh lpR fFf">
    <q-header :class="isDark ? 'bg-dark' : 'bg-primary'" reveal>
      <q-toolbar class="q-py-sm">
        <div class="row items-center cursor-pointer" @click="$router.push('/')">
          <div class="col">
            <div class="text-h4 text-weight-bold text-white">KiwiCook</div>
            <div :class="isDark ? 'text-secondary' : 'text-black'" class="text-subtitle2">Reclaim your kitchen</div>
          </div>
          <div class="col-auto q-ml-md">
            <q-avatar class="rounded-borders" color="white" size="48px">
              <q-img height="36px" src="/icons/icon-500x500.png" width="36px"/>
            </q-avatar>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container :class="isDark ? 'bg-dark-gradient' : 'bg-gradient'" class="rounded-borders q-pa-md page">
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
import { useQuasar } from 'quasar';
import { ref } from 'vue';

defineOptions({
  name: 'MainLayout',
});

const $q = useQuasar();
const isDark = ref($q.dark.isActive);

const toggleDarkMode = () => {
  $q.dark.toggle();
  isDark.value = $q.dark.isActive;
};

const openGithub = () => window.open('https://github.com/kiwi-cook/kiwi-cook');
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

.mode-toggle {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
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

  .chat-bubble .q-message-text {
    background-color: rgba(255, 255, 255, 0.05) !important;
  }

  .kiwi-bubble .q-message-text {
    border-color: #2c3e50;
  }

  .user-bubble .q-message-text {
    background-color: #2c3e50 !important;
  }

  .typing-indicator {
    color: #a0a0a0;
  }
}
</style>
