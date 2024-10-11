<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal class="bg-kiwi-green">
      <q-toolbar class="q-py-sm">
        <div class="row items-center cursor-pointer" @click="$router.push('/')">
          <div class="col">
            <div class="text-h4 text-weight-bold text-white">KiwiCook</div>
            <div class="text-subtitle2 text-black">Reclaim your kitchen</div>
          </div>
          <div class="col-auto q-ml-md">
            <q-avatar size="48px" class="bg-white rounded-borders">
              <q-img src="/icons/icon-500x500.png" width="36px" height="36px" />
            </q-avatar>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'MainLayout',
});
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
