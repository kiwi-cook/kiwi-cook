<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal class="bg-black text-white">
      <q-toolbar>
        <div class="q-pa-md text-white" @click="$router.push('/')">
          <div class="text-h4 text-weight-bold">KiwiCook 🥝</div>
          <div class="text-subtitle1 text-green-14">Reclaim your kitchen</div>
        </div>
        <q-ajax-bar/>
      </q-toolbar>
    </q-header>

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
