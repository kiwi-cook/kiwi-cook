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
        <q-scroll-area style="height: 60vh;">
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
          :disable="disableChatbox"
          @keyup.enter.prevent="() => sendUserMessage()"
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
import { onMounted, ref } from 'vue';
import { useRecipeStore } from 'stores/recipe-store.ts';
import { Recipe } from 'src/models/recipe.ts';

interface Message {
  id: number;
  sender: string;
  sent: boolean;
  disableChatbox?: boolean;
  waitForResponse?: boolean;
  actionAfterResponse?: (message: string) => void;
}

type MessageContent = ({
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
}) & {
  disableChatbox?: boolean;
  waitForResponse?: boolean;
  actionAfterResponse?: (message: string) => void;
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

type ChatMessage = OptionMessage | RecipeMessage | TextMessage | ImageMessage;

const userOptionsFromChat = {
  servings: 1,
  recipeType: 'Quick & Easy',
  ingredients: [] as string[],
};

const messages = ref<ChatMessage[]>([]);

enum kiwiMessageStates { START, SERVINGS, RECIPE_TYPE, INGREDIENTS, SEARCHING }

const kiwiMessageState = ref(kiwiMessageStates.START);
const kiwiStartMessages = ref<MessageContent[]>([
  {
    content: 'Hey there! 🥝 Welcome to KiwiCook, your personal cooking assistant! Ready to make something delicious today?',
    type: 'text',
  },
  {
    content: 'For how many kiwis are you cooking for today?',
    type: 'text',
  },
  {
    content: ['1', '2', '3', '4+'],
    type: 'options',
    waitForResponse: true,
    actionAfterResponse: (message: string) => {
      userOptionsFromChat.servings = parseInt(message, 10);
      kiwiMessageState.value = kiwiMessageStates.RECIPE_TYPE;
    },
  },
  {
    content: 'Awesome! Now, let’s narrow it down. What kind of recipe are you in the mood for?',
    type: 'text',
  },
  {
    content: ['Quick & Easy', 'Vegetarian', 'Desserts', 'Gourmet'],
    type: 'options',
    waitForResponse: true,
    actionAfterResponse: (message: string) => {
      userOptionsFromChat.recipeType = message;
      kiwiMessageState.value = kiwiMessageStates.INGREDIENTS;
    },
    disableChatbox: true,
  },
  {
    content: 'Great choice! 🍽️ One more thing—any specific ingredients you want to use?',
    type: 'text',
    waitForResponse: true,
    actionAfterResponse: (message: string) => {
      userOptionsFromChat.ingredients = message.split(',').map((ingredient) => ingredient.trim());
      kiwiMessageState.value = kiwiMessageStates.SEARCHING;
      // TODO: Search for recipes
    },
  },
]);
const disableChatbox = ref(false);
const actionAfterResponse = ref<((message: string) => void) | undefined>(undefined);
const newMessage = ref('');

const recipeStore = useRecipeStore();

function sendKiwiMessage(content: string | string[] | Recipe | MessageContent) {
  disableChatbox.value = false;
  if (!content) {
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
    actionAfterResponse.value = message.actionAfterResponse;
    disableChatbox.value = message.disableChatbox || false;
  }

  messages.value.push({
    id: messages.value.length + 1,
    sender: 'Kiwi',
    sent: false,
    ...message,
  });
}

async function searchRecipe(recipeName: string) {
  const recipes = await recipeStore.searchRecipe(recipeName);
  if (recipes.length === 0) {
    sendKiwiMessage('Sorry, I couldn’t find any recipes matching your criteria. Let’s try something else!');
    kiwiMessageState.value = kiwiMessageStates.START;
    return;
  }

  sendKiwiMessage('Here are some recipes I found for you:');
  recipes.forEach((recipe) => {
    sendKiwiMessage(recipe);
  });
}

function kiwiChat() {
  const message = kiwiStartMessages.value.shift();
  if (!message) {
    return;
  }

  sendKiwiMessage(message);
  if (message.waitForResponse) {
    return;
  }
  kiwiChat();
}

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
  newMessage.value = '';

  if (actionAfterResponse.value) {
    // Call action after response
    console.log('Calling action after response:', text);
    actionAfterResponse.value(text);
    actionAfterResponse.value = undefined;
  } else {
    try {
      console.log('Searching for recipe:', text);
      await searchRecipe(text);
      return;
    } catch (error) {
      console.error(error);
    }
  }

  // Simulated response
  setTimeout(() => {
    kiwiChat();
  }, 1000);
}

onMounted(() => {
  kiwiChat();
});
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
</style>
