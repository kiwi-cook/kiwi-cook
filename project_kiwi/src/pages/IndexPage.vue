<template>
  <q-page class="bg-black text-white">
    <div class="row q-pa-md">
      <!-- Header -->
      <div class="col-12 q-mb-md">
        <div class="text-h2 text-weight-bold">Kiwi 🥝</div>
        <div class="text-h4 text-green-14">Reclaim your kitchen</div>
      </div>

      <!-- Color bar -->
      <div class="col-12 q-mb-md color-bar">
        <div class="color-segment bg-white" style="width: 35%"></div>
        <div class="color-segment bg-black" style="width: 35%"></div>
        <div class="color-segment bg-green-3" style="width: 10%"></div>
        <div class="color-segment bg-green-7" style="width: 5%"></div>
        <div class="color-segment bg-green-9" style="width: 5%"></div>
        <div class="color-segment bg-green" style="width: 10%"></div>
      </div>

      <!-- Chat area -->
      <div class="col-12 q-mb-md chat-container">
        <q-scroll-area style="height: 60vh;">
          <div v-for="message in messages" :key="message.id" class="q-pa-md">
            <q-chat-message
              :name="message.sender"
              :sent="message.sent"
              :bg-color="message.sent ? 'green-7' : 'grey-9'"
              text-color="white"
            >
              <template v-if="message.type === 'text'">
                <div>{{ message.content }}</div>
              </template>
              <template v-else-if="message.type === 'image'">
                <q-img :src="message.content" style="max-width: 200px;"/>
              </template>
              <template v-else-if="message.type === 'recipe'">
                <div class="recipe-card q-pa-md">
                  <div class="text-h6">{{ message.content.name }}</div>
                  <q-img :src="message.content.image" style="max-width: 200px;" class="q-my-md"/>
                  <div>Cooking Time: {{ message.content.cookingTime }}</div>
                  <div>Difficulty: {{ message.content.difficulty }}</div>
                  <q-btn color="green-5" class="q-mt-sm" label="View Recipe"/>
                </div>
              </template>
              <template v-else-if="message.type === 'options'">
                <div class="options-list">
                  <q-btn v-for="option in message.content"
                         :key="option"
                         color="green-5"
                         class="q-ma-xs"
                         :label="option"
                         @click="sendMessage(option)"/>
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
          filled
          type="textarea"
          bottom-slots
          label="What would you like to cook?"
          bg-color="grey-9"
          text-color="white"
          label-color="green-14"
          color="green-14"
          dark
        >
          <template v-slot:after>
            <q-btn round dense flat icon="send" color="green" @click="$event => sendMessage()"/>
          </template>
        </q-input>
      </div>

      <!-- Footer -->
      <div class="col-12 q-mt-md">
        <div class="row justify-between items-center">
          <div class="col-auto">
            <q-btn flat color="green-5" label="Learn More"/>
          </div>
          <div class="col-auto">
            <q-icon name="arrow_upward" color="green-5" size="24px"/>
            <q-icon name="science" color="green-5" size="24px" class="q-ml-sm"/>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRecipeStore } from 'stores/recipe-store.ts';

interface Message {
  id: number;
  sender: string;
  sent: boolean;
}

interface OptionMessage extends Message {
  type: 'options';
  content: string[];
}

interface RecipeMessage extends Message {
  type: 'recipe';
  content: {
    name: string; image: string;
    cookingTime: string; difficulty: string
  };
}

interface TextMessage extends Message {
  type: 'text';
  content: string;
}

interface ImageMessage extends Message {
  type: 'image';
  content: string;
}

const messages = ref<(OptionMessage|RecipeMessage|TextMessage|ImageMessage)[]>([
  {
    id: 1,
    sender: 'Kiwi',
    type: 'text',
    content: 'Ready to revolutionize your cooking? For how many people would you like to cook today?',
    sent: false,
  },
  {
    id: 2,
    sender: 'Kiwi',
    type: 'options',
    content: ['Quick & Easy', 'Vegetarian', 'Desserts', 'Gourmet'],
    sent: false,
  },
]);
const newMessage = ref('');

const recipeStore = useRecipeStore();

function sendMessage(text = newMessage.value) {
  if (text.trim()) {
    messages.value.push({
      id: messages.value.length + 1,
      sender: 'You',
      type: 'text',
      content: text,
      sent: true,
    });
    // Simulated response
    setTimeout(() => {
      const recipe = recipeStore.getRandomRecipe();
      messages.value.push({
        id: messages.value.length + 1,
        sender: 'Kiwi',
        type: 'recipe',
        content: {
          name: recipe.name.translations['en-US'],
          image: recipe.image_url || 'https://via.placeholder.com/200',
          cookingTime: `${recipe.duration} min`,
          difficulty: 'Easy',
        },
        sent: false,
      });
    }, 1000);
    newMessage.value = '';
  }
}
</script>

<style lang="scss">
.color-bar {
  display: flex;
  height: 20px;
  margin-bottom: 20px;
}

.color-segment {
  height: 100%;
}

.chat-container {
  border: 2px solid $green-14;
}

.q-message-text {
  border-radius: 0;
  padding: 12px 16px;
  margin: 4px 0;
}

.q-message-text--sent {
  background: $green-7;
}

.q-message-name {
  font-weight: bold;
  color: $green-5;
}
</style>
