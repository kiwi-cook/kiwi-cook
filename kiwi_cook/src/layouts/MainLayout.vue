<template>
  <q-layout
    :class="[{ 'bg-gradient-light': !isDark, 'bg-gradient-dark': isDark }]"
    view="hHh lpR fFf"
  >
    <!-- Header -->
    <q-header class="header">
      <q-toolbar class="q-py-sm">
        <!-- Logo -->
        <div class="row items-center cursor-pointer" @click="$router.push('/')">
          <div class="col">
            <KiwiLogo />
          </div>
        </div>
        <q-space />

        <!-- Login/Logout Button -->
        <q-btn class="q-mr-md" flat :color="isDark ? 'white' : 'dark'" @click="loginLogout">
          <q-icon v-if="!isAuthenticated" name="mdi-login" />
          <q-icon v-else name="mdi-logout" />
          <q-tooltip>{{ isAuthenticated ? $t('app.logout') : $t('app.login') }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Page Container -->
    <q-page-container :class="isDark ? 'bg-dark-gradient' : 'bg-gradient'">
      <router-view v-slot="{ Component }">
        <transition mode="out-in" name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Footer -->
    <q-footer :class="{ 'bg-primary': !isDark, 'bg-dark': isDark }" class="footer">
      <q-toolbar>
        <!-- GitHub Link -->
        <q-btn :text-color="isDark ? 'white' : 'dark'" flat icon="mdi-github" @click="openGithub">
          <q-tooltip>{{ $t('app.githubTooltip') }}</q-tooltip>
        </q-btn>
        <q-space />

        <!-- Tabs -->
        <q-tabs v-model="tab" :class="isDark ? 'text-white' : 'text-black'" align="center" dense>
          <q-tab
            v-for="t in tabs"
            :key="t.name"
            :name="t.name"
            :icon="t.icon"
            :label="t.name"
            @click="t.click"
          />
        </q-tabs>
        <q-space />

        <!-- Dark Mode Toggle -->
        <q-btn
          :color="isDark ? 'secondary' : 'white'"
          :icon="isDark ? 'wb_sunny' : 'nightlight_round'"
          :text-color="isDark ? 'primary' : 'dark'"
          class="q-ml-md"
          flat
          @click="toggleDarkMode"
        >
          <q-tooltip>{{ isDark ? $t('app.lightMode') : $t('app.darkMode') }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useDarkMode } from 'src/composables/useDarkmode'
import KiwiLogo from 'src/components/KiwiLogo.vue'
import { useUserStore } from 'src/stores/user-store'

defineOptions({
  name: 'MainLayout',
})

const router = useRouter()

/* Dark Mode */
const { isDark, toggleDarkMode } = useDarkMode()

/* GitHub Link */
const openGithub = () => window.open('https://github.com/kiwi-cook/kiwi-cook')

/* Login/Logout */
const userStore = useUserStore()
const { isAuthenticated } = storeToRefs(userStore)

const loginLogout = () => {
  if (isAuthenticated.value) {
    userStore.logout()
  } else {
    router.push('/login')
  }
}

/* Tabs */
const tabs = [{ name: 'Chat', icon: 'chat', click: () => router.push({ name: 'chat' }) }]
const tab = ref('chat')

watch(
  () => router.currentRoute.value.name,
  (newRoute) => {
    const activeTab = tabs.find((t) => t.name.toLowerCase() === newRoute)
    tab.value = activeTab ? activeTab.name : ''
  },
  { immediate: true }
)
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

body {
  font-family: 'Nunito', sans-serif;
  font-size: calc(100% + 0.5vw);
}

.header {
  backdrop-filter: blur(12px) !important;
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
