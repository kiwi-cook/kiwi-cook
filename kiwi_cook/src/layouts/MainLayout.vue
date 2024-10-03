<template>
  <q-layout view="hHh lpR fFf">
    <div class="q-pa-md bg-black text-white" @click="$router.push('/')">
      <div class="text-h4 text-weight-bold">KiwiCook 🥝</div>
      <div class="text-subtitle1 text-green-14">Reclaim your kitchen</div>
    </div>

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'MainLayout',
});
</script>
