<template>
    <div class="container">
        <div class="waiting-container">
            <div ref="floatingFoods"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';

const foodEmojis = ['🍕', '🥗', '🍔', '🍣', '🥙', '🥞', '🍝', '🍜', '🍛', '🍲', '🍥', '🍱', '🍙', '🍚', '🍘', '🍧', '🍨', '🍮']
const floatingFoods = ref<HTMLElement | null>(null);

function createFood(floatingFoods: HTMLElement | null) {
    if (!floatingFoods) {
        return;
    }

    const food = document.createElement('div');
    food.classList.add('food');
    food.innerHTML = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
    const position = Math.random() * 100;
    food.style.left = `${position}%`;
    floatingFoods.appendChild(food);
    setTimeout(() => {
        food.remove();
    }, 4000);
}

createFood(floatingFoods.value);
createFood(floatingFoods.value);
createFood(floatingFoods.value);
createFood(floatingFoods.value);
createFood(floatingFoods.value);
setInterval(() => {
    createFood(floatingFoods.value);
}, 150);
</script>

<style>
.container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.waiting-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.food {
    font-size: 36px;
    opacity: 0.8;
    position: absolute;
    animation: floatSpinFood 10s infinite cubic-bezier(.17, .67, .79, 1.24)
}

@keyframes floatSpinFood {
    from {
        transform: translateY(50px) rotate(0deg);
    }
    to {
        transform: translateY(1020px) rotate(360deg);
    }
}
</style>