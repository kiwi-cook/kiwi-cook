<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div class="logarithmic-slider">
        <IonRange
            :value="logValue"
            max="100"
            min="1"
            @ionChange="handleSliderChange"
        />
        <div class="slider-value">Selected Value: {{ displayValue }}</div>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import {IonRange} from '@ionic/vue';

// Initial logarithmic value
const logValue = ref(10);

// Handle slider change
const handleSliderChange = (event) => {
    logValue.value = event.detail.value;
};

// Compute actual display value from logarithmic value
const displayValue = computed(() => Math.pow(10, logValue.value / 20).toFixed(2));
</script>

<style scoped>
.logarithmic-slider {
    padding: 20px;
}

.slider-value {
    margin-top: 10px;
    font-size: 1.1rem;
    color: #333;
}
</style>
