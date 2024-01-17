<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div class="smart-questions-container x mandatory-scroll-snapping">
        <slot name="default"/> <!-- Default slot for question components -->
    </div>
</template>

<script lang="ts" setup>
</script>

<style>
.smart-questions-container {
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    overflow-x: scroll;
    overflow-y: hidden;
    gap: 15px;
    width: 100%;
    background: inherit;
}

.smart-questions-container > * {
    text-align: center;
    scroll-snap-align: center;
    transition: var(--transition);
}
</style>
