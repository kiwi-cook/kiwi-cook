<template>
  <div class="meal-plan-spinner">
    <div class="spinner-wrapper">
      <!-- Center Logo -->
      <div class="logo-container">
        <q-avatar class="rounded-borders" size="48px">
          <q-img height="36px" src="/icons/icon-512x512.png" width="36px" />
        </q-avatar>
      </div>

      <!-- Rotating Items -->
      <div class="rotating-items">
        <template v-for="(item, index) in spinnerItems" :key="index">
          <div
            class="spinner-item"
            :style="{
              transform: `rotate(${index * (360 / spinnerItems.length)}deg) translateY(-60px)`,
            }"
          >
            <div class="bubble-container">
              <template v-if="item.type === 'icon'">
                <q-icon
                  :name="item.content"
                  :size="item.size || '32px'"
                  :color="item.color || 'primary'"
                />
              </template>
              <template v-else-if="item.type === 'image'">
                <q-img
                  :src="item.content"
                  :width="item.size || '32px'"
                  :height="item.size || '32px'"
                />
              </template>
              <template v-else-if="item.type === 'text'">
                <div class="text-item">{{ item.content }}</div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const spinnerItems = [
  { type: 'icon', content: 'restaurant_menu', color: 'deep-orange' },
  { type: 'icon', content: 'lunch_dining', color: 'brown-5' },
  { type: 'text', content: '🥗', size: '24px' },
  { type: 'icon', content: 'local_pizza', color: 'red' },
  { type: 'icon', content: 'kitchen', color: 'green' },
  { type: 'text', content: '👨‍🍳', size: '24px' },
  { type: 'icon', content: 'local_cafe', color: 'brown' },
  { type: 'icon', content: 'cake', color: 'pink' },
]
</script>

<style scoped>
.meal-plan-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.spinner-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}

.logo-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  animation: pulse 2s infinite ease-in-out;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.rotating-items {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: rotate 8s infinite linear;
}

.spinner-item {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  margin: -20px;
}

.text-item {
  font-size: 24px;
  line-height: 1;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Light Mode */
.bubble-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.6));
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  box-shadow:
    /* Outer glow */
    0 4px 15px rgba(255, 255, 255, 0.4),
    /* Main shadow */ 0 8px 20px rgba(0, 0, 0, 0.1),
    /* Inner highlight */ inset 0 -4px 8px rgba(0, 0, 0, 0.1),
    /* Top inner highlight */ inset 0 4px 8px rgba(255, 255, 255, 0.8),
    /* Subtle border */ 0 0 0 1px rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.bubble-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  opacity: 0.7;
}

.bubble-container::after {
  content: '';
  position: absolute;
  top: 10%;
  left: 20%;
  width: 20%;
  height: 20%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.1) 80%);
  border-radius: 50%;
}

.bubble-container:hover {
  transform: scale(1.1) translateY(-5px);
  box-shadow:
    0 8px 25px rgba(255, 255, 255, 0.5),
    0 12px 30px rgba(0, 0, 0, 0.15),
    inset 0 -4px 12px rgba(0, 0, 0, 0.15),
    inset 0 4px 12px rgba(255, 255, 255, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.6);
}

/* Dark Mode */
.body--dark .bubble-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  box-shadow:
    /* Outer glow */
    0 4px 15px rgba(0, 0, 0, 0.4),
    /* Main shadow */ 0 8px 20px rgba(0, 0, 0, 0.3),
    /* Inner highlight */ inset 0 -4px 8px rgba(255, 255, 255, 0.05),
    /* Top inner highlight */ inset 0 4px 8px rgba(255, 255, 255, 0.1),
    /* Subtle border */ 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.body--dark .bubble-container::before {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.05) 50%,
    transparent 70%
  );
  opacity: 0.5;
}

.body--dark .bubble-container::after {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.02) 80%);
}

.body--dark .bubble-container:hover {
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.5),
    0 12px 30px rgba(0, 0, 0, 0.3),
    inset 0 -4px 12px rgba(255, 255, 255, 0.05),
    inset 0 4px 12px rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.15);
}
</style>
