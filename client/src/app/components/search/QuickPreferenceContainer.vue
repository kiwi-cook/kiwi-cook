<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div class="quick-preference-container x mandatory-scroll-snapping">
        <slot name="preferences"/> <!-- Default slot for question components -->
    </div>
    <div class="">
        <slot name="full-width-content"/>
    </div>
</template>

<script lang="ts" setup>
</script>

<style>
.quick-preference-container {
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    overflow-x: scroll;
    overflow-y: hidden;
    gap: 15px;
    width: 100%;
    background: inherit;
}

.quick-preference-container > * {
    text-align: center;
    scroll-snap-align: center;
    transition: var(--transition);
}

@media (max-width: 450px) {
    .quick-preference-container {
        gap: 5px;
    }
}
</style>
