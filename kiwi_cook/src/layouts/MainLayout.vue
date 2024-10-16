<template>
  <q-layout view="hHh lpR fFf" :class="[{ 'bg-gradient-light': !isDark, 'bg-gradient-dark': isDark }]">
    <q-header reveal :class="isDark ? 'bg-dark' : 'bg-primary'">
      <q-toolbar class="q-py-sm">
        <div class="row items-center cursor-pointer" @click="$router.push('/')">
          <div class="col">
            <div class="text-h4 text-weight-bold text-white">KiwiCook</div>
            <div class="text-subtitle2" :class="isDark ? 'text-secondary' : 'text-black'">Reclaim your kitchen</div>
          </div>
          <div class="col-auto q-ml-md">
            <q-avatar size="48px" class="bg-white rounded-borders">
              <q-img src="/icons/icon-500x500.png" width="36px" height="36px"/>
            </q-avatar>
          </div>
        </div>

        <q-btn
          round
          size="md"
          :color="isDark ? 'secondary' : 'white'"
          :text-color="isDark ? 'dark' : 'primary'"
          :icon="isDark ? 'wb_sunny' : 'nightlight_round'"
          class="q-ml-md mode-toggle"
          @click="toggleDarkMode"
        >
          <q-tooltip>{{ isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container :class="isDark ? 'bg-dark-gradient' : 'bg-gradient'">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component"/>
        </transition>
      </router-view>
    </q-page-container>

    <q-footer :class="{ 'bg-primary': !isDark, 'bg-dark': isDark }" class="footer">
      <q-toolbar>
        <q-btn flat :text-color="isDark ? 'white' : 'dark'" icon="mdi-github" @click="openGithub">
          <q-tooltip>Visit our GitHub</q-tooltip>
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

.rounded-borders {
  border-radius: 12px;
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
