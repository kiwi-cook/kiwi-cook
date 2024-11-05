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
                class="chat-bubble apple-bubble"
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
                      <div v-for="recipe in message.content" :key="recipe.id">
                        <ChatRecipePreview :recipe="recipe"/>
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
                      :disable="messages.slice(messageIndex + 1).some((m) => m.sender !== message.sender)"
                      class="option-button"
                      unelevated
                      rounded
                      :ripple="false"
                      @click="handleMessage(option)"
                    />
                  </div>
                </template>

                <template v-else-if="message.type === 'slider'">
                  <div class="slider-container q-pa-md rounded-borders">
                    <div class="text-subtitle1 q-mb-sm">{{ message.content.label }}</div>

                    <q-slider
                      v-model="message.content.value"
                      :min="message.content.min"
                      :max="message.content.max"
                      :step="message.content.step"
                      :disable="messages.slice(messageIndex + 1).some((m) => m.sender !== message.sender)"
                      :label-always="!messages.slice(messageIndex + 1).some((m) => m.sender !== message.sender)"
                      :label-value="message.content.value + ' ' +
                      (typeof message.content.unit === 'function' ? message.content.unit(message.content.value) : message.content.unit)"
                      color="primary"
                      aria-label="Slider"
                      @input="onSliderChange"
                      class="slider-enhanced"
                    />

                    <div class="row items-center justify-between q-mt-sm">
                      <q-btn
                        color="primary"
                        icon="send"
                        round
                        dense
                        class="send-button shadow-1"
                        v-if="messages.slice(messageIndex + 1).every((m) => m.sender === message.sender)"
                        @click="handleMessage(message.content.value)"
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
  computed, nextTick, ref, watch,
} from 'vue';
import { QScrollArea, QSlider, useQuasar } from 'quasar';
import { useChatStore } from 'stores/chat-store';
import { storeToRefs } from 'pinia';
import ChatRecipePreview from 'components/recipe/ChatRecipePreview.vue';

const $q = useQuasar();
const isDark = computed(() => $q.dark.isActive);

const chat = useChatStore();
const {
  messages, isTyping,
} = storeToRefs(chat);
const { handleMessage } = chat;

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

// Slider
function onSliderChange() {
  // Check if the vibration API is supported
  if (navigator.vibrate) {
    navigator.vibrate(50); // Vibrate for 50 milliseconds
  }
}
</script>

<style lang="scss">
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
  border-radius: 20px;
  padding: 12px 16px;
  max-width: 50vw;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s, box-shadow 0.2s;
}

/* Adjust max-width for smaller screens */
@media (max-width: 700px) {
  .chat-bubble .q-message-text {
    max-width: 80vw;
  }
}

.kiwi-bubble .q-message-text {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border-radius: 20px 20px 20px 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.user-bubble .q-message-text {
  background: linear-gradient(135deg, #8bc34a, #7cb342, #689f38);
  color: white;
  border-radius: 20px 20px 4px 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.apple-bubble.first-message .q-message-text {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.apple-bubble.next-message-same .q-message-text {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  margin-top: 2px;
}

.apple-bubble.last-message-same .q-message-text {
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  margin-bottom: 4px;
}

.recipe-scroll-container {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-behavior: smooth;
  padding: 8px 0;

  &::-webkit-scrollbar {
    display: none; // Hide scrollbar for Webkit browsers
  }
}

.recipe-scroll-wrapper {
  display: flex;
  gap: 16px; // Adds space between cards
  padding-left: 8px; // Adds a bit of padding on the left for spacing
}

.recipe-scroll-wrapper > div {
  flex: 0 0 auto; // Prevents cards from shrinking or wrapping
  width: 280px; // Fixed width for each card for consistency
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
