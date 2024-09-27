<template>
  <q-page class="bg-black text-white">
    <div class="row q-pa-md">
      <!-- Header -->
      <div class="col-12 q-mb-md">
        <div class="text-h2 text-weight-bold">KiwiCook 🥝</div>
        <div class="text-h4 text-green-14">Reclaim your kitchen</div>
      </div>

      <!-- Chat area -->
      <div class="col-12 q-mb-md chat-container">
        <q-scroll-area style="height: 60vh;" ref="scrollArea">
          <div v-for="message in messages" :key="message.id" class="q-pl-md q-py-sm">
            <q-chat-message
              :bg-color="message.sent ? 'green-7' : 'grey-9'"
              :name="message.sender"
              :sent="message.sent"
              text-color="white"
            >
              <template v-if="message.type === 'text'">
                <div v-html="message.content"/>
              </template>
              <template v-else-if="message.type === 'image'">
                <q-img :src="message.content" style="max-width: 200px;"/>
              </template>
              <template v-else-if="message.type === 'recipe'">
                <div class="recipe-card q-pa-md">
                  <div class="text-h6">{{ message.content.name }}</div>
                  <q-img :src="message.content.image_url" class="q-my-md" style="max-width: 200px;"/>
                  <div>Cooking Time: {{ message.content.duration }}</div>
                  <div>Difficulty: {{ message.content.difficulty }}</div>
                  <!-- <q-btn class="q-mt-sm" color="green-5" label="View Recipe" @click="viewRecipe(message.content)"/> -->
                </div>
              </template>
              <template v-else-if="message.type === 'options' || message.type === 'multiOptions'">
                <div class="options-list">
                  <q-btn v-for="option in message.content"
                         :key="option"
                         :label="option"
                         class="q-ma-xs"
                         color="green-5"
                         @click="handleOptionClick(option, message.type)"/>
                  <template v-if="message.type === 'multiOptions'">
                    <div class="text-caption text-weight-bold q-mt-sm">Select all that apply</div>
                    <q-btn color="green" dense flat icon="send" round @click="$event => sendUserMessage()"/>
                  </template>
                </div>
              </template>
              <template v-else-if="message.type === 'slider'">
                <div class="slider-container q-pa-md">
                  <div class="text-subtitle1">{{ message.content.label }}</div>
                  <q-slider
                    v-model="message.content.value"
                    :min="message.content.min"
                    :max="message.content.max"
                    :step="message.content.step"
                    label
                    color="green-5"
                    @change="handleSliderChange(message.content.value)"
                  />
                </div>
              </template>
            </q-chat-message>
          </div>
        </q-scroll-area>
      </div>

      <!-- Input area -->
      <div class="col-12">
        <q-input
          v-model="newMessage"
          bg-color="grey-9"
          bottom-slots
          color="green-14"
          dark
          filled
          label="What would you like to cook?"
          label-color="green-14"
          text-color="white"
          :disable="disableChatbox"
          @keyup.enter.prevent="sendUserMessage"
        >
          <template v-slot:after>
            <q-btn color="green" dense flat icon="send" round @click="$event => sendUserMessage()"/>
          </template>
        </q-input>
      </div>

      <!-- Footer -->
      <div class="col-12 q-mt-md">
        <div class="row justify-between items-center">
          <div class="col-auto">
            <q-btn color="green-5" flat label="Learn More"/>
            <q-btn
              color="green-5"
              flat
              icon="mdi-github"
              @click="openGithub"
            />
          </div>
          <div class="col-auto">
            <q-icon color="green-5" name="arrow_upward" size="24px"/>
            <q-icon class="q-ml-sm" color="green-5" name="science" size="24px"/>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { useChat } from 'src/composables/useChat.ts';

const chat = useChat();
const {
  messages,
  disableChatbox,
  newMessage,
  scrollArea,
  sendUserMessage,
  handleOptionClick,
  handleSliderChange,
} = chat;

const openGithub = () => window.open('https://github.com/kiwi-cook/kiwi-cook');
</script>

<style lang="scss">
.chat-container {
  border: 2px solid $green-14;
}

.q-message-text {
  border-radius: 0;
  padding: 12px 16px;
  margin: 4px 0;
  font-size: 16px;
}

.q-message-text--sent {
  background: $green-7;
}

.q-message-name {
  font-weight: bold;
  color: $green-5;
}

.slider-container {
  width: 100%;
  max-width: 300px;
}
</style>
