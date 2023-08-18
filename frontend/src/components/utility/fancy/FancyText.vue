<template>
    <span
        class="header-msg-highlight">{{ text }}</span>
</template>

<script lang="ts" setup>
defineProps({
    text: String
})
</script>

<style scoped>
.header-msg-highlight {
    color: var(--ion-color-primary);
    font-weight: var(--font-weight-bolder);
}
</style>