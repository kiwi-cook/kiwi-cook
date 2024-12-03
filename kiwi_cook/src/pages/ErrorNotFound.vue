<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">4🥝4</div>

      <div class="text-h2" style="opacity: 0.4">
        {{ $t('error.notFound') }}
      </div>

      <q-btn
        :label="$t('error.backToHome')"
        class="q-mt-xl q-mb-md"
        no-caps
        size="lg"
        to="/"
        unelevated
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'ErrorNotFound',
})
</script>
