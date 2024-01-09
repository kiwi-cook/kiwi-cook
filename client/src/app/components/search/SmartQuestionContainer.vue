<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <h3>2 schnelle Fragen</h3>
    <div class="smart-questions-container">
        <slot/> <!-- Default slot for question components -->
    </div>
</template>

<script setup>
</script>

<style>
.smart-questions-container {
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
    overflow-y: hidden;
    padding: 10px;
    gap: var(--margin);
}

.smart-questions-container > * {
    min-width: 300px; /* Minimum width for each question card */
    min-height: 200px; /* Minimum height for each question card */
}
</style>
