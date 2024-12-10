<template>
  <q-page class="page">
    <div
      v-for="(message, index) in messages"
      :key="message.id"
      :class="[
        'fade-enter-active',
        {
          'q-mt-md': messages[index - 1]?.sender !== message.sender,
        },
      ]"
    >
      <ChatMessage
        :message="message"
        :disabled="index !== messages.length - 1"
        :hidden="message.type !== 'text' && index !== messages.length - 1 && !message.sent"
        :index="index"
        :is-dark="isDark"
        :is-typing="isTyping && index === messages.length - 1"
        :previous-sender="messages[index - 1]?.sender || 'system'"
        :next-sender="messages[index + 1]?.sender || 'system'"
        @edit-message="editMessage"
        @send-message="handleMessage"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useChatStore } from 'stores/chat/chat-store'
import { useDarkMode } from 'src/composables/useDarkmode'
import ChatMessage from 'components/chat/ChatMessage.vue'

const { isDark } = useDarkMode()
const chat = useChatStore()
const { messages, isTyping } = storeToRefs(chat)

// Scroll to the bottom of the chat
const scrollToBottom = () => {
  nextTick(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    })
  })
}
watch(() => messages.value.length, scrollToBottom, { immediate: true })
onMounted(scrollToBottom)

// Handle message actions
const handleMessage = (content: string) => {
  chat.handleMessage(content)
}

const editMessage = (id: number) => {
  chat.editMessage(id)
}
</script>

<style lang="scss">
.page {
  padding: 16px;
  background-color: var(--q-page-bg);
}
</style>
