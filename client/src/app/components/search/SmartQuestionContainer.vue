<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <h3>3 <span class="italic">schnelle</span> Fragen</h3>
    <div class="smart-questions-container x mandatory-scroll-snapping">
        <slot name="default"/> <!-- Default slot for question components -->
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
    gap: 25px;
}

.smart-questions-container > * {
    text-align: center;
    scroll-snap-align: center;
    flex: none;
    min-width: 300px; /* Minimum width for each question card */
    height: 150px; /* Minimum height for each question card */
    transition: all 0.3s ease-in-out;
}

@media (max-width: 736px) {
    .smart-questions-container {
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: scroll;
        gap: 10px;
    }

    .smart-questions-container > * {
        padding-left: 10px;
        text-align: left;
        min-width: 100%;
        height: unset;
        padding-bottom: 10px;
    }
}
</style>
