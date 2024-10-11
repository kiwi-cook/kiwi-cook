<template>
  <q-page :class="{ 'bg-gradient-light': !isDark, 'bg-gradient-dark': isDark }" class="chat-page">
    <!-- Chat area -->
    <div class="chat-container q-pa-md">
      <q-scroll-area class="chat-scroll" ref="scrollArea">
        <div class="chat-messages-wrapper">
          <transition-group name="fade">
            <div v-for="message in messages" :key="message.id" class="q-mb-md">
              <q-chat-message
                :bg-color="message.sent ? 'secondary' : 'transparent'"
                :name="message.sender"
                :sent="message.sent"
                :stamp="message.timestamp"
                :text-color="message.sent ? 'white' : (isDark ? 'grey-3' : 'grey-9')"
                class="chat-bubble"
                :class="{ 'kiwi-bubble': !message.sent, 'user-bubble': message.sent }"
              >
                <template v-if="message.type === 'text'">
                  <div v-html="message.content" class="chat-text"/>
                </template>
                <template v-else-if="message.type === 'image'">
                  <q-img :src="message.content" class="chat-image" alt="Chat image"/>
                </template>
                <template v-else-if="message.type === 'recipe'">
                  <q-carousel
                    v-model="activeSlide"
                    transition-prev="slide-right"
                    transition-next="slide-left"
                    swipeable
                    animated
                    control-color="primary"
                    navigation
                    padding
                    arrows
                    height="400px"
                    class="bg-grey-1 shadow-2 rounded-borders"
                  >
                    <q-carousel-slide v-for="recipe in message.content" :key="recipe.id" :name="recipe.id"
                                      class="column no-wrap">
                      <div class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap">
                        <q-img class="rounded-borders col-5" :src="recipe.image_url" :alt="getTranslation(recipe.name)">
                          <template v-slot:loading>
                            <q-spinner-dots color="primary"/>
                          </template>
                        </q-img>
                        <div class="col-7">
                          <div class="text-h6 ellipsis-2-lines" :class="{ 'text-white': isDark }">
                            {{ getTranslation(recipe.name) }}
                          </div>
                          <!-- <q-rating v-model="recipe.rating" :max="5" size="32px" color="accent" readonly/> -->
                          <div class="row q-col-gutter-sm q-mt-sm">
                            <div class="col-6">
                              <q-icon name="schedule" color="primary" size="xs"/>
                              {{ recipe.duration }} min
                            </div>
                            <div class="col-6">
                              <q-icon name="fitness_center" color="primary" size="xs"/>
                              {{ recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) }}
                            </div>
                          </div>
                          <q-btn flat color="primary" class="q-mt-md" :to="`/recipe/${recipe.id}`">View Recipe</q-btn>
                          <!-- <q-btn flat color="accent" class="q-mt-md q-ml-sm" @click="saveRecipe(recipe)">
                            <q-icon name="favorite"/>
                            <q-tooltip>Save Recipe</q-tooltip>
                          </q-btn> -->
                        </div>
                      </div>
                    </q-carousel-slide>
                  </q-carousel>
                </template>
                <template v-else-if="message.type === 'options' || message.type === 'multiOptions'">
                  <div class="options-list q-gutter-x-sm q-gutter-y-xs">
                    <q-btn v-for="(option, optionIndex) in message.content"
                           :key="optionIndex"
                           :label="option"
                           class="option-button"
                           unelevated
                           rounded
                           :ripple="false"
                           @click="() => handleMessage(option)"/>
                  </div>
                </template>
                <template v-else-if="message.type === 'slider'">
                  <div class="slider-container q-pa-md">
                    <div class="text-subtitle1 q-mb-sm">{{ message.content.label }}</div>
                    <q-slider
                      v-model="message.content.value"
                      :min="message.content.min"
                      :max="message.content.max"
                      :step="message.content.step"
                      label
                      color="primary"
                      :label-always="$q.screen.lt.sm"
                      aria-label="Slider"
                    />
                    <div class="row items-center justify-between q-mt-sm">
                      <div class="text-body2 text-weight-medium">
                        {{ message.content.value }} {{ message.content.unit }}
                      </div>
                      <q-btn color="primary" icon="send" round dense
                             @click="handleSliderInput(message.content.value)"/>
                    </div>
                  </div>
                </template>
              </q-chat-message>
            </div>
          </transition-group>
          <div v-if="isTyping" class="typing-indicator q-my-md">
            <q-spinner-dots color="primary" size="2em"/>
            <span class="q-ml-sm">Kiwi is typing...</span>
          </div>
        </div>
      </q-scroll-area>
    </div>

    <!-- Input area -->
    <div class="input-area q-pa-md">
      <KiwiChatBox/>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { QScrollArea, useQuasar } from 'quasar';
import KiwiChatBox from 'components/KiwiChatBox.vue';
import { useChatStore } from 'stores/chat-store';
import { storeToRefs } from 'pinia';
import { getTranslation } from 'src/models/recipe';

const $q = useQuasar();
const isDark = ref($q.dark.isActive);

const chat = useChatStore();
const { messages, isTyping } = storeToRefs(chat);
const {
  handleSliderInput,
  handleMessage,
} = chat;

// Scrolling
// Code generated by Claude.ai
const scrollArea = ref<QScrollArea | null>(null);
const scrollToBottom = () => {
  nextTick(() => {
    if (scrollArea.value) {
      const scrollTarget = scrollArea.value.getScrollTarget();
      const startPosition = scrollTarget.scrollTop;
      const endPosition = scrollTarget.scrollHeight;
      const distance = endPosition - startPosition;

      // Adjust these values to fine-tune the animation
      const minDuration = 400; // milliseconds
      const maxDuration = 1200; // milliseconds
      const pixelsPerMillisecond = 3;

      const duration = Math.min(
        maxDuration,
        Math.max(minDuration, distance / pixelsPerMillisecond),
      );

      animateScroll(startPosition, endPosition, duration);
    }
  });
};

const animateScroll = (start: number, end: number, duration: number) => {
  const startTime = performance.now();

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    const currentPosition = start + (end - start) * easedProgress;

    scrollArea.value?.setScrollPosition('vertical', currentPosition, 0);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};
const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
watch(() => messages.value.length, scrollToBottom, { immediate: true });

// End of scrolling code

const activeSlide = ref(null);
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.chat-page {
  font-family: 'Nunito', sans-serif;
  font-size: 16px;
  min-height: 100vh;

  @media screen and (min-width: 600px) {
    font-size: 18px;
  }

  @media screen and (min-width: 1280px) {
    font-size: 20px;
  }
}

.bg-gradient-light {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.bg-gradient-dark {
  background: linear-gradient(135deg, #2c3e50 0%, #1a202c 100%);
}

.chat-container {
  height: calc(100vh - 250px);
  width: 100%;
  overflow-x: hidden;
}

.chat-scroll {
  height: 100%;
}

.chat-messages-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.chat-bubble {
  .q-message-text {
    border-radius: 16px;
    padding: 14px 18px;
  }

  .q-message-name {
    font-size: 1.1em;
    font-weight: 600;
  }
}

.kiwi-bubble {
  .q-message-text {
    background-color: rgba(255, 255, 255, 0.1) !important;
    border: 2px solid var(--kiwi-green);
    border-bottom-left-radius: 0;
  }
}

.user-bubble {
  .q-message-text {
    background-color: var(--kiwi-green) !important;
    border-bottom-right-radius: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.chat-text {
  font-size: 1em;
  line-height: 1.7;
}

.chat-image {
  max-width: 100%;
  border-radius: 8px;
}

.recipe-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;

  @media screen and (min-width: 600px) {
    height: 250px;
  }
}

.option-button {
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.slider-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.options-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding: 8px 0;
}

.option-button {
  flex: 0 0 auto;
  font-size: 1em;
  padding: 10px 18px;
  border-radius: 24px;
  background-color: var(--q-primary) !important;
  color: white !important;
  font-weight: 600;
  min-width: 80px;
  margin: 6px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

.mode-toggle {
  opacity: 0.9;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
}

.footer {
  font-size: 1em;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.typing-indicator {
  display: flex;
  align-items: center;
  font-style: italic;
  color: var(--q-primary);
}

@media (max-width: $breakpoint-xs-max) {
  .recipe-card .row {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
