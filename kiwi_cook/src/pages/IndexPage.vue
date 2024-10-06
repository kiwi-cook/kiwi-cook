<template>
  <q-page :class="{ 'bg-kiwi-light': !isDark, 'bg-kiwi-dark': isDark }" class="chat-page">
    <!-- Floating mode toggle -->
    <q-btn
      round
      size="md"
      :color="isDark ? 'yellow' : 'kiwi-dark'"
      :text-color="isDark ? 'kiwi-dark' : 'white'"
      :icon="isDark ? 'wb_sunny' : 'nightlight_round'"
      class="fixed-top-right q-ma-md mode-toggle"
      @click="toggleDarkMode"
    >
      <q-tooltip>{{ isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}</q-tooltip>
    </q-btn>

    <!-- Chat area -->
    <div class="chat-container q-pa-md">
      <q-scroll-area class="chat-scroll" ref="scrollArea">
        <div class="chat-messages-wrapper">
          <div v-for="message in messages" :key="message.id" class="q-py-sm">
            <q-chat-message
              :bg-color="message.sent ? 'kiwi-green' : (isDark ? 'kiwi-dark-accent' : 'kiwi-light-accent')"
              :name="message.sender"
              :sent="message.sent"
              :text-color="message.sent ? 'white' : (isDark ? 'white' : 'black')"
              class="chat-bubble"
            >
              <template v-if="message.type === 'text'">
                <div v-html="message.content" class="chat-text"/>
              </template>
              <template v-else-if="message.type === 'image'">
                <q-img :src="message.content" class="chat-image"/>
              </template>
              <template v-else-if="message.type === 'recipe'">
                <q-card v-for="recipe in message.content" :key="recipe.id" class="recipe-card q-ma-sm" :dark="isDark">
                  <q-card-section>
                    <div class="text-h6 text-kiwi-green">{{ getTranslation(recipe.name) }}</div>
                    <div class="row q-col-gutter-md items-center justify-between">
                      <div class="col-12 col-sm-auto">
                        <q-img :src="recipe.image_url" class="recipe-image">
                          <template v-slot:loading>
                            <q-spinner-dots color="kiwi-green"/>
                          </template>
                        </q-img>
                      </div>
                      <div class="col-12 col-sm">
                        <div class="row q-col-gutter-sm">
                          <div class="col-6">
                            <q-icon name="schedule" color="kiwi-green" size="xs"/>
                            {{ recipe.duration }} min
                          </div>
                          <div class="col-6">
                            <q-icon name="fitness_center" color="kiwi-green" size="xs"/>
                            {{ recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn flat color="kiwi-green" :to="`/recipe/${recipe.id}`">View Recipe</q-btn>
                  </q-card-actions>
                </q-card>
              </template>
              <template v-else-if="message.type === 'options' || message.type === 'multiOptions'">
                <div class="options-list q-gutter-x-sm q-gutter-y-xs">
                  <q-btn v-for="(option, optionIndex) in message.content"
                         :key="optionIndex"
                         :label="isMessageOption(option) ? option.label : option"
                         class="option-button"
                         unelevated
                         rounded
                         :ripple="false"
                         @click="handleOptionClick(option, message.type)"/>
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
                    color="kiwi-green"
                    :label-always="$q.screen.lt.sm"
                  />
                  <div class="row items-center justify-between q-mt-sm">
                    <div class="text-body2 text-weight-medium">
                      {{ message.content.value }} {{ message.content.unit }}
                    </div>
                    <q-btn color="kiwi-green" icon="send" round dense
                           @click="handleSliderInput(message.content.value)"/>
                  </div>
                </div>
              </template>
            </q-chat-message>
          </div>
        </div>
      </q-scroll-area>
    </div>

    <!-- Input area -->
    <div class="input-area q-pa-md">
      <KiwiChatBox/>
    </div>

    <!-- Footer -->
    <q-footer :class="{ 'bg-kiwi-green': !isDark, 'bg-kiwi-dark': isDark }" class="footer">
      <q-toolbar>
        <q-btn flat :text-color="isDark ? 'white' : 'kiwi-dark'" icon="mdi-github" @click="openGithub">
          <q-tooltip>Visit our GitHub</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-footer>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import KiwiChatBox from 'components/KiwiChatBox.vue';
import { useChatStore } from 'stores/chat-store';
import { storeToRefs } from 'pinia';
import { getTranslation } from 'src/models/recipe';
import { isMessageOption } from 'src/models/chat';

const $q = useQuasar();
const isDark = ref($q.dark.isActive);

const chat = useChatStore();
const { messages, scrollArea } = storeToRefs(chat);
const {
  handleSliderInput,
  handleOptionClick,
} = chat;

const openGithub = () => window.open('https://github.com/kiwi-cook/kiwi-cook');

const toggleDarkMode = () => {
  $q.dark.toggle();
  isDark.value = $q.dark.isActive;
};
</script>

<style lang="scss">
.chat-page {
  font-size: 14px;

  @media screen and (min-width: 600px) {
    font-size: 16px;
  }

  @media screen and (min-width: 1280px) {
    font-size: 18px;
  }
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
    border-radius: 12px;
    padding: 8px 12px;
  }
}

.chat-text {
  font-size: 1em;
  line-height: 1.4;
}

.chat-image {
  max-width: 200px;
  border-radius: 8px;
}

.recipe-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
}

.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;

  @media screen and (min-width: 600px) {
    width: 150px;
    height: 150px;
  }
}

.option-button {
  margin-bottom: 8px;
}

.slider-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.options-list {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 4px 0;
}

.option-button {
  flex: 0 0 auto;
  font-size: 0.9em;
  padding: 4px 12px;
  border-radius: 16px;
  background-color: var(--kiwi-option-bg) !important;
  color: var(--kiwi-option-text) !important;
  font-weight: 500;
  min-width: 40px;
}

.mode-toggle {
  opacity: 0.9;
}

.footer {
  font-size: 1em;
}

@media (max-width: $breakpoint-xs-max) {
  .recipe-card .row {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
