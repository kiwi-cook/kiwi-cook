<template>
  <q-page class="bg-black text-white">
    <!-- Chat area -->
    <div class="chat-container q-pa-md">
      <q-scroll-area class="chat-scroll" ref="scrollArea">
        <div v-for="message in messages" :key="message.id" class="q-py-sm">
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
              <q-img :src="message.content" class="chat-image"/>
            </template>
            <template v-else-if="message.type === 'recipe'">
              <div v-for="recipe in message.content" :key="recipe.id" class="recipe-card q-pa-md">
                <router-link :to="`/recipe/${ recipe.id }`" class="text-h6 text-bold text-green-14 q-mb-sm q-mr-sm">
                  {{ getTranslation(recipe.name) }}
                </router-link>
                <div class="row q-col-gutter-md items-start">
                  <div class="col-auto">
                    <q-img :src="recipe.image_url" class="recipe-image"/>
                  </div>
                  <div class="col">
                    <div class="text-caption">
                      <strong>Cooking Time:</strong> {{ recipe.duration }} min
                    </div>
                    <div class="text-caption">
                      <strong>Difficulty:</strong>
                      {{ recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="message.type === 'options' || message.type === 'multiOptions'">
              <div class="options-list q-gutter-xs">
                <q-btn v-for="(option, optionIndex) in message.content"
                       :key="optionIndex"
                       :label="isMessageOption(option) ? option.label : option"
                       color="green-5"
                       @click="handleOptionClick(option, message.type)"/>
                <template v-if="message.type === 'multiOptions'">
                  <div class="text-caption text-weight-bold q-mt-sm">Select all that apply</div>
                  <q-btn color="green" icon="send" round @click="sendUserMessage()"/>
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
                  @change="handleSliderInput(message.content.value)"
                />
              </div>
            </template>
          </q-chat-message>
        </div>
      </q-scroll-area>
    </div>

    <!-- Input area -->
    <div class="input-area q-pa-md">
      <KiwiChatBox/>
    </div>

    <!-- Footer -->
    <div class="footer q-pa-md row justify-between items-center">
      <div>
        <q-btn flat color="green-5" label="LEARN MORE" class="q-mr-sm"/>
        <q-btn flat color="green-5" icon="mdi-github" @click="openGithub"/>
      </div>
      <div>
        <q-icon name="arrow_upward" color="green-5" size="sm" class="q-mr-sm"/>
        <q-icon name="science" color="green-5" size="sm"/>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import KiwiChatBox from 'components/KiwiChatBox.vue';
import { useChatStore } from 'stores/chat-store.ts';
import { storeToRefs } from 'pinia';
import { getTranslation } from 'src/models/recipe.ts';
import { isMessageOption } from 'src/models/chat.ts';

const chat = useChatStore();
const { messages, scrollArea } = storeToRefs(chat);
const {
  sendUserMessage,
  handleSliderInput,
  handleOptionClick,
} = chat;

const openGithub = () => window.open('https://github.com/kiwi-cook/kiwi-cook');
</script>

<style lang="scss">
.q-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.chat-container {
  flex-grow: 1;
  border: 2px solid $green-14;
  overflow: hidden;
}

.chat-scroll {
  height: 90%;
}

.input-area {
  flex-grow: 0;
}

.footer {
  flex-grow: 0;
}

.q-message-text {
  border-radius: 0;
  padding: 8px 12px;
  margin: 4px 0;
  font-size: 16px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border: 5px solid transparent;
  }

  &--sent {
    background: $green-7;

    &:before {
      right: -10px;
      border-left-color: $green-7;
      border-bottom-color: $green-7;
    }
  }

  &--received {
    background: $grey-9;

    &:before {
      left: -10px;
      border-right-color: $grey-9;
      border-bottom-color: $grey-9;
    }
  }
}

.q-message-name {
  font-weight: bold;
  color: $green-5;
  margin-bottom: 4px;
}

.chat-image {
  max-width: 200px;
  border-radius: 4px;
}

.recipe-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.recipe-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.slider-container {
  width: 100%;
  max-width: 300px;
}

@media (max-width: $breakpoint-xs-max) {
  .recipe-card .row {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
