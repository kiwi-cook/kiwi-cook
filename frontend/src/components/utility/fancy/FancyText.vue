<template>
    <span
        class="header-msg-highlight">{{ text }}</span>
</template>

<script setup lang="ts">
defineProps({
    text: String
})
</script>

<style scoped>
.header-msg-highlight {
    color: var(--ion-color-primary);
}
</style>