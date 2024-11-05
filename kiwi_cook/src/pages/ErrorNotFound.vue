<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        4🥝4
      </div>

      <div class="text-h2" style="opacity:.4">
        {{ $t('error.notFound') }}
      </div>

      <q-btn
        class="q-mt-xl q-mb-md"
        size="lg"
        :label="$t('error.backToHome')"
        no-caps
        to="/"
        unelevated
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'ErrorNotFound',
});
</script>
