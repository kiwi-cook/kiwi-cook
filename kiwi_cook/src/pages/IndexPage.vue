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
                  <q-img :src="message.content.image_url" class="q-my-md" style="max-width: 200px;"/>
                  <div>Cooking Time: {{ message.content.duration }}</div>
                  <div>Difficulty: {{ message.content.difficulty }}</div>
                  <q-btn class="q-mt-sm" color="green-5" label="View Recipe" @click="viewRecipe(message.content)"/>
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
import { useRecipeStore } from 'stores/recipe-store';
import { Recipe } from 'src/models/recipe';

interface UserPreferences {
  servings: number;
  recipeType: string;
  dietaryRestrictions: string[];
  cookingTime: number;
  skillLevel: string;
  cuisine: string;
}

interface MessageInterface {
  id: number;
  sender: string;
  sent: boolean;
  type: 'text' | 'image' | 'recipe' | 'options' | 'multiOptions' | 'slider';
  content: unknown;
}

interface TextMessage extends MessageInterface {
  type: 'text';
  content: string;
}

interface ImageMessage extends MessageInterface {
  type: 'image';
  content: string;
}

interface RecipeMessage extends MessageInterface {
  type: 'recipe';
  content: Recipe;
}

interface OptionsMessage extends MessageInterface {
  type: 'options';
  content: string[];
}

interface MultiOptionsMessage extends MessageInterface {
  type: 'multiOptions';
  content: string[];
}

interface SliderMessage extends MessageInterface {
  type: 'slider';
  content: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
  };
}

type Message = TextMessage | ImageMessage | RecipeMessage | OptionsMessage | MultiOptionsMessage | SliderMessage;

const messages = ref<Message[]>([]);
const userPreferences = ref<UserPreferences>({
  servings: 2,
  recipeType: '',
  dietaryRestrictions: [],
  cookingTime: 30,
  skillLevel: 'Beginner',
  cuisine: '',
});

const kiwiMessageState = ref<'start' | 'recipeType' | 'dietaryRestrictions' | 'cookingTime' | 'cuisine'>('start');
const disableChatbox = ref(false);
const newMessage = ref('');

const recipeStore = useRecipeStore();

function sendKiwiMessage(message: Omit<Message, 'id' | 'sender' | 'sent'>) {
  const kiwiMessage = {
    id: messages.value.length + 1,
    sender: 'Kiwi',
    sent: false,
    ...message,
  } as Message;

  messages.value.push(kiwiMessage);
}

function askForServings() {
  sendKiwiMessage({
    type: 'text',
    content: 'How many people are you cooking for today?',
  });
  sendKiwiMessage({
    type: 'options',
    content: ['1', '2', '3', '4', '5+'],
  });
}

function askForRecipeType() {
  sendKiwiMessage({
    type: 'text',
    content: 'What type of recipe are you in the mood for?',
  });
  sendKiwiMessage({
    type: 'options',
    content: ['Quick & Easy', 'Healthy', 'Comfort Food', 'Gourmet', 'Budget-friendly'],
  });
}

function askForDietaryRestrictions() {
  sendKiwiMessage({
    type: 'text',
    content: 'Do you have any dietary restrictions or preferences? (Select all that apply)',
  });
  sendKiwiMessage({
    type: 'multiOptions',
    content: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low-carb', 'None'],
  });
}

function askForCookingTime() {
  sendKiwiMessage({
    type: 'text',
    content: 'How much time do you have for cooking today?',
  });
  sendKiwiMessage({
    type: 'slider',
    content: {
      label: 'Cooking time (in minutes)',
      value: 30,
      min: 15,
      max: 120,
      step: 15,
    },
  });
}

function askForCuisine() {
  sendKiwiMessage({
    type: 'text',
    content: 'Any particular cuisine you\'re craving?',
  });
  sendKiwiMessage({
    type: 'options',
    content: ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Surprise me!'],
  });
}

async function searchRecipes() {
  sendKiwiMessage({
    type: 'text',
    content: 'Great! Let me find some recipes that match your preferences...',
  });

  try {
    const recipes = await recipeStore.searchRecipe(userPreferences.value.dietaryRestrictions.join(','));
    if (recipes.length === 0) {
      sendKiwiMessage({
        type: 'text',
        content: 'I couldn\'t find any recipes matching your exact criteria. Would you like me to broaden the search?',
      });
      sendKiwiMessage({
        type: 'options',
        content: ['Yes, please', 'No, let\'s start over'],
      });
    } else {
      sendKiwiMessage({
        type: 'text',
        content: 'Here are some recipes I found for you:',
      });
      recipes.forEach((recipe) => {
        sendKiwiMessage({
          type: 'recipe',
          content: recipe,
        });
      });
      sendKiwiMessage({
        type: 'text',
        content: 'Would you like to see more recipes or start cooking one of these?',
      });
      sendKiwiMessage({
        type: 'options',
        content: ['See more recipes', 'Start cooking', 'New search'],
      });
    }
  } catch (error) {
    console.error(error);
    sendKiwiMessage({
      type: 'text',
      content: 'I\'m sorry, but I encountered an error while searching for recipes. Shall we try again?',
    });
  }
}

function viewRecipe(recipe: Recipe) {
  // Implement the logic to view the full recipe details
  console.log('Viewing recipe:', recipe);
}

function sendUserMessage(text: string = newMessage.value) {
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

  switch (kiwiMessageState.value) {
    case 'start':
      userPreferences.value.servings = parseInt(text, 10);
      kiwiMessageState.value = 'recipeType';
      askForRecipeType();
      break;
    case 'recipeType':
      userPreferences.value.recipeType = text;
      kiwiMessageState.value = 'dietaryRestrictions';
      askForDietaryRestrictions();
      break;
    case 'dietaryRestrictions':
      kiwiMessageState.value = 'cookingTime';
      askForCookingTime();
      break;
    case 'cuisine':
      userPreferences.value.cuisine = text;
      searchRecipes();
      break;
    default:
      // Handle other cases or user input
      break;
  }
}

function handleOptionClick(option: string, type: string) {
  if (type === 'multiOptions') {
    if (newMessage.value.includes(option)) {
      newMessage.value = newMessage.value.replace(option, '').trim();
    } else {
      newMessage.value += ` ${option}`;
    }
  } else {
    sendUserMessage(option);
  }
}

function handleSliderChange(value: number) {
  userPreferences.value.cookingTime = value;
  sendKiwiMessage({
    type: 'text',
    content: `Great! I'll look for recipes that take about ${value} minutes to prepare.`,
  });
  kiwiMessageState.value = 'cuisine';
  askForCuisine();
}

onMounted(() => {
  sendKiwiMessage({
    type: 'text',
    content: 'Hey there! 🥝 Welcome to KiwiCook, your personal cooking assistant! Ready to whip up something delicious?',
  });
  askForServings();
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

.slider-container {
  width: 100%;
  max-width: 300px;
}
</style>
