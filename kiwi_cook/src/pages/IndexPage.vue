<template>
  <q-page class="chat-page">
    <div class="chat-container q-pa-md">
      <q-scroll-area class="chat-scroll" ref="scrollArea">
        <div class="chat-messages-wrapper">
          <transition-group name="fade">
            <div v-for="(message, messageIndex) in messages" :key="message.id"
                 :class="['fade-enter-active', {'q-mt-md': messages[messageIndex - 1]?.sender !== message.sender}]">
              <q-chat-message
                :bg-color="message.sent ? 'secondary' : 'transparent'"
                :name="messages[messageIndex - 1]?.sender !== message.sender ? message.sender : ''"
                :sent="message.sent"
                :stamp="message.timestamp"
                :text-color="message.sent ? 'white' : (isDark ? 'white' : 'grey-9')"
                class="chat-bubble"
                :class="{
                  'kiwi-bubble': !message.sent,
                  'user-bubble': message.sent,
                  'next-message-same': messages[messageIndex + 1]?.sender === message.sender,
                  'last-message-same': messages[messageIndex - 1]?.sender === message.sender && messageIndex !== 0,
                }"
              >
                <template v-if="message.type === 'text'">
                  <div v-html="message.content" class="chat-text"/>
                </template>

                <template v-else-if="message.type === 'image'">
                  <q-img :src="message.content" class="chat-image" alt="Chat image"/>
                </template>

                <template v-else-if="message.type === 'recipe'">
                  <div class="recipe-scroll-container">
                    <div class="recipe-scroll-wrapper">
                      <div v-for="recipe in message.content" :key="recipe.id" class="recipe-card">
                        <q-card class="recipe-card">
                          <q-img
                            :src="recipe.image_url"
                            :alt="getTranslation(recipe.name)"
                            class="recipe-image"
                          >
                            <div class="recipe-title q-pa-sm">
                              {{ getTranslation(recipe.name) }}
                            </div>
                          </q-img>

                          <q-card-section class="q-pt-md">
                            <div class="recipe-details row items-center justify-between q-gutter-sm">
                              <div class="col-auto">
                                <q-icon name="schedule" color="primary" size="xs"/>
                                {{ recipe.duration }} min
                              </div>
                              <div class="col-auto">
                                <q-icon name="fitness_center" color="primary" size="xs"/>
                                {{ capitalize(recipe.difficulty) }}
                              </div>
                            </div>
                          </q-card-section>

                          <q-card-actions align="right" class="q-mt-auto">
                            <q-btn flat color="primary" :to="`/recipe/${recipe.id}`">View Recipe</q-btn>
                          </q-card-actions>
                        </q-card>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else-if="message.type === 'options' || message.type === 'multiOptions'">
                  <div class="options-list">
                    <q-btn
                      v-for="(option, optionIndex) in message.content"
                      :key="optionIndex"
                      :label="option"
                      :disable="message.id !== (currentId - 1)"
                      class="option-button"
                      unelevated
                      rounded
                      :ripple="false"
                      @click="handleMessage(option)"
                    />
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
                      :disable="message.id !== (currentId - 1)"
                      label
                      color="primary"
                      aria-label="Slider"
                    />
                    <div class="row items-center justify-between q-mt-sm">
                      <div class="text-body2 text-weight-medium">
                        {{ message.content.value }} {{ message.content.unit }}
                      </div>
                      <q-btn
                        color="primary"
                        icon="send"
                        round
                        dense
                        v-if="message.id === (currentId - 1)"
                        @click="handleSliderInput(message.content.value)"
                      />
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
  </q-page>
</template>

<script setup lang="ts">
import {
  capitalize, computed, nextTick, ref, watch,
} from 'vue';
import { QScrollArea, useQuasar } from 'quasar';
import { useChatStore } from 'stores/chat-store';
import { storeToRefs } from 'pinia';
import { getTranslation } from 'src/models/recipe';

const $q = useQuasar();
const isDark = computed(() => $q.dark.isActive);

const chat = useChatStore();
const {
  messages, isTyping, currentId,
} = storeToRefs(chat);
const { handleSliderInput, handleMessage } = chat;

const scrollArea = ref<QScrollArea | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollArea.value) {
      const scrollTarget = scrollArea.value.getScrollTarget();
      const startPosition = scrollTarget.scrollTop;
      const endPosition = scrollTarget.scrollHeight;
      const distance = endPosition - startPosition;

      const minDuration = 400;
      const maxDuration = 1200;
      const pixelsPerMillisecond = 3;

      const duration = Math.min(maxDuration, Math.max(minDuration, distance / pixelsPerMillisecond));
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

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
watch(() => messages.value.length, scrollToBottom, { immediate: true });
</script>

<style lang="scss">
.chat-page {
  font-size: 16px;
  min-height: 100vh;

  @media screen and (min-width: 600px) {
    font-size: 18px;
  }

  @media screen and (min-width: 1280px) {
    font-size: 20px;
  }
}

.chat-container {
  height: calc(90vh);
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

.chat-bubble .q-message-text {
  border-radius: 16px;
  padding: 14px 18px;
}

.kiwi-bubble .q-message-text {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border: 2px solid var(--q-primary);
  border-bottom-left-radius: 0;
}

.user-bubble .q-message-text {
  background-color: var(--q-primary) !important;
  border-bottom-right-radius: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.next-message-same {
  border-top-left-radius: 0;
  margin-bottom: 4px;

  .q-message-text {
    border-bottom-left-radius: 0;
  }
}

.last-message-same {
  .q-message-text {
    border-top-left-radius: 0;
  }
}

.recipe-scroll-container {
  width: 70vw;
  overflow-x: auto;
  scrollbar-width: none;
}

.recipe-scroll-wrapper {
  display: flex;
  gap: 16px;
  padding: 16px;
}

.recipe-card {
  flex: 0 0 auto;
  width: 280px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.recipe-title {
  background: rgba(0, 0, 0, 0.6);
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  padding: 8px 0;
}

.option-button {
  padding: 10px 18px;
  border-radius: 24px;
  background-color: var(--q-primary);
  color: white;
  font-weight: 600;
  margin: 6px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  color: var(--q-primary);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
