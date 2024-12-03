<template>
  <div class="q-mt-sm kiwi-logo">
    <span v-if="withText" class="title">KiwiCook</span>
    <q-avatar class="rounded-borders" size="48px">
      <q-img height="36px" src="/icons/icon-512x512.png" width="36px" />
    </q-avatar>
  </div>
</template>

<script setup lang="ts">
// Props

interface LogoProps {
  withText?: boolean
}

withDefaults(defineProps<LogoProps>(), {
  withText: true,
})
</script>

<style scoped lang="scss">
.kiwi-logo {
  display: flex;
  align-items: center;

  .title {
    font-size: 1.5em;
    font-weight: 600;
    margin-right: 0.1em;
  }
}
</style>
