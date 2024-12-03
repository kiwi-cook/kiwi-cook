<template>
  <q-chat-message
    :class="bubbleClasses"
    :name="showSenderName ? message.sender : ''"
    :sent="message.sent"
    :stamp="message.timestamp"
    :text-color="message.sent ? 'white' : isDark ? 'white' : 'grey-9'"
    class="chat-bubble"
  >
    <div>
      <template v-if="isTyping">
        <LoadingSpinner />
      </template>

      <template v-else-if="message.type === 'text'">
        <div class="chat-text" v-html="sanitizedContent" />
      </template>

      <template v-else-if="message.type === 'image'">
        <q-img :src="message.content" alt="Chat image" class="chat-image" />
      </template>

      <template v-else-if="message.type === 'recipe'">
        <div class="recipe-scroll-container">
          <div class="recipe-scroll-wrapper">
            <div v-for="recipe in message.content" :key="recipe.id">
              <ChatRecipePreview :recipe="recipe" />
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="message.type === 'options' || message.type === 'multiOptions'">
        <div class="options-list">
          <q-btn
            v-for="(option, optionIndex) in message.content"
            :key="optionIndex"
            :disable="disabled"
            :label="option"
            :ripple="false"
            class="option-button"
            rounded
            unelevated
            @click="emit('send-message', option)"
          />
        </div>
      </template>

      <template v-else-if="message.type === 'suggestion'">
        <div class="chat-suggestion-container">
          <!-- Suggestions List -->
          <q-list v-if="message.content(userInput).length > 0" class="suggestions-list" separator>
            <q-item
              v-for="(item, itemIndex) in message.content(userInput)"
              :key="itemIndex"
              clickable
              class="suggestion-item"
              @click="emit('send-message', item)"
            >
              <q-item-section>
                <q-item-label><span v-html="highlightInput(item, userInput)" /></q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="no-suggestions text-caption text-grey-7">
            {{ message.notFoundText ?? $t('chat.suggestion.notFound') }}
          </div>

          <div v-if="message.withSubmit" class="input-wrapper">
            <q-input
              v-model="userInput"
              class="suggestion-input"
              dense
              autofocus
              borderless
              standout
              square
              :placeholder="$t('chat.input.placeholder')"
              color="primary"
            >
              <template #append>
                <q-btn
                  color="primary"
                  dense
                  flat
                  round
                  icon="send"
                  @click="emit('send-message', message.submitText ? message.submitText : userInput)"
                />
              </template>
            </q-input>
          </div>
        </div>
      </template>

      <template v-else-if="message.type === 'slider'">
        <div class="slider-container q-pa-md rounded-borders">
          <div class="text-subtitle1 q-mb-sm">
            {{ message.content.label }}
          </div>

          <q-slider
            v-model="message.content.value"
            :disable="disabled"
            :label-always="true"
            :label-value="
              message.content.value +
              ' ' +
              (typeof message.content.unit === 'function'
                ? message.content.unit(message.content.value)
                : message.content.unit)
            "
            :max="message.content.max"
            :min="message.content.min"
            :step="message.content.step"
            aria-label="Slider"
            class="slider-enhanced"
            color="primary"
          />

          <div class="row items-center justify-between q-mt-sm">
            <q-btn
              v-if="!disabled"
              class="send-button shadow-1"
              color="primary"
              dense
              icon="send"
              round
              @click="emit('send-message', message.content.value)"
            />
          </div>
        </div>
      </template>

      <!-- Button to edit the message -->
      <div v-if="message.sent" class="edit-button">
        <q-btn color="secondary" dense flat icon="edit" @click="emit('edit-message', message.id)" />
      </div>
    </div>
  </q-chat-message>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import DOMPurify from 'dompurify'

import type { Message } from 'src/models/chat'
import ChatRecipePreview from 'components/recipe/ChatRecipePreview.vue'
import LoadingSpinner from 'components/chat/LoadingSpinner.vue'

// Types
interface ChatMessage {
  message: Message
  disabled: boolean
  index: number
  isDark: boolean
  isTyping: boolean
  previousSender: string
  nextSender: string
}

// Props
const props = defineProps<ChatMessage>()

const { message } = toRefs(props)

// Emits
const emit = defineEmits(['edit-message', 'send-message'])

const showSenderName = computed(() => props.previousSender !== props.message.sender)
const bubbleClasses = computed(() => ({
  'kiwi-bubble': !props.message.sent,
  'user-bubble': props.message.sent,
  'next-message-same': props.nextSender === props.message.sender,
  'last-message-same': props.previousSender === props.message.sender,
}))

const sanitizedContent = computed(() => {
  if (props.message.type === 'text') {
    return DOMPurify.sanitize(props.message.content)
  }
  return ''
})

// Data
const userInput = ref('')

// Input
function highlightInput(text: string, snippet: string) {
  if (!snippet) {
    return text
  }
  const regex = new RegExp(`(${snippet})`, 'gi')
  return text.replace(regex, '<strong>$1</strong>')
}
</script>

<style lang="scss">
.chat-bubble .q-message-text {
  border-radius: 20px;
  padding: 12px 16px;
  max-width: 50vw;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.2s,
    box-shadow 0.2s;
}

/* Remove the default border and triangle */
.q-message-text::before {
  content: none !important;
  border: none !important;
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

.chat-suggestion-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.suggestions-list {
  border-radius: 8px;
  max-height: 250px;
  overflow-y: auto;
  padding: 8px;
}

.suggestion-item {
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.input-wrapper {
  border: 1px solid $grey-3;
  border-radius: 12px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within,
.input-wrapper:hover {
  border-color: $primary;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-input {
  width: 100%;

  .q-field__control {
    padding: 0;
  }
}

.input-field {
  font-size: 16px;
  padding: 8px 0;
}

.send-button {
  margin-left: 8px;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background-color: rgba(0, 125, 255, 0.1);
  }
}

.no-suggestions {
  text-align: center;
  padding: 8px;
  font-style: italic;
}

.typing-indicator {
  display: flex;
  align-items: center;
  color: var(--q-primary);
}

.body--dark {
  .chat-bubble .q-message-text {
    background-color: rgba(255, 255, 255, 0.05) !important;
  }

  .kiwi-bubble .q-message-text {
    border-color: #2c3e50;
  }

  .user-bubble .q-message-text {
    background-color: #2c3e50 !important;
  }

  .typing-indicator {
    color: #a0a0a0;
  }
}
</style>
