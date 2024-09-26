<template>
  <q-page class="bg-black text-white">
    <div class="row q-pa-md">
      <!-- Header -->
      <div class="col-12 q-mb-md">
        <div class="text-h2 text-weight-bold">KiwiCook 🥝</div>
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
              :bg-color="message.sent ? 'green-7' : 'grey-9'"
              :name="message.sender"
              :sent="message.sent"
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
                  <q-img :src="message.content.image" class="q-my-md" style="max-width: 200px;"/>
                  <div>Cooking Time: {{ message.content.cookingTime }}</div>
                  <div>Difficulty: {{ message.content.difficulty }}</div>
                  <q-btn class="q-mt-sm" color="green-5" label="View Recipe"/>
                </div>
              </template>
              <template v-else-if="message.type === 'options'">
                <div class="options-list">
                  <q-btn v-for="option in message.content"
                         :key="option"
                         :label="option"
                         class="q-ma-xs"
                         color="green-5"
                         @click="sendUserMessage(option)"/>
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
          type="textarea"
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

<script lang="ts" setup>
import { ref } from 'vue';
import { useRecipeStore } from 'stores/recipe-store.ts';
import { Recipe } from 'src/models/recipe.ts';

interface Message {
  id: number;
  sender: string;
  sent: boolean;
}

type MessageContent = {
  content: string;
  type: 'text';
} | {
  content: string;
  type: 'image';
} | {
  content: string[];
  type: 'options';
} | {
  content: {
    name: string; image: string;
    cookingTime: string; difficulty: string
  };
  type: 'recipe';
};

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

type ChatMessage = OptionMessage | RecipeMessage | TextMessage | ImageMessage;

const messages = ref<ChatMessage[]>([]);
const startMessages = ref<MessageContent[]>([
  {
    content: 'Hey there! 👋 Welcome to KiwiCook, your personal cooking assistant! Ready to make something delicious today?',
    type: 'text',
  },
  {
    content: 'I can help you find the perfect recipe, whether you’re short on time or craving something special.',
    type: 'text',
  },
]);
const newMessage = ref('');

const recipeStore = useRecipeStore();

function sendKiwiMessage(content: string | string[] | Recipe | MessageContent) {
  if (!content) {
    console.log('No content to send');
    return;
  }

  let message: MessageContent;

  if (typeof content === 'string') {
    message = { type: 'text', content };
  } else if (Array.isArray(content)) {
    message = { type: 'options', content };
  } else if ('name' in content && 'image_url' in content) {
    message = {
      type: 'recipe',
      content: {
        name: content.name.translations['en-US'],
        image: content.image_url || 'https://via.placeholder.com/200',
        cookingTime: `${content.duration} min`,
        difficulty: 'Easy',
      },
    };
  } else {
    message = content as MessageContent;
  }

  messages.value.push({
    id: messages.value.length + 1,
    sender: 'Kiwi',
    sent: false,
    ...message,
  });
}

startMessages.value.forEach((message) => sendKiwiMessage(message));

async function sendUserMessage(text = newMessage.value) {
  if (!text.trim()) {
    return;
  }

  messages.value.push({
    id: messages.value.length + 1,
    sender: 'You',
    type: 'text',
    content: text,
    sent: true,
  });

  // Try to search for a recipe
  let recipe = recipeStore.getRandomRecipe();

  try {
    console.log('Searching for recipe:', text);
    const [searchedRecipe] = await recipeStore.searchRecipe(text) as Recipe[];
    if (searchedRecipe) {
      recipe = searchedRecipe;
    }
  } catch (error) {
    console.error(error);
  }

  console.log('Recipe:', recipe);

  // Simulated response
  setTimeout(() => {
    sendKiwiMessage(recipe);
  }, 1000);
  newMessage.value = '';
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
  font-size: 16px;
}

.q-message-text--sent {
  background: $green-7;
}

.q-message-name {
  font-weight: bold;
  color: $green-5;
}
</style>
