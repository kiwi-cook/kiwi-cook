import {
  computed, nextTick, onMounted, ref,
} from 'vue';
import { QScrollArea } from 'quasar';
import { useRecipeStore } from 'stores/recipe-store.ts';
import {
  UserPreferences, Message, KiwiMessageState, MessageType,
} from 'src/models/kiwiChat.ts';

export function useChat() {
  const KIWI_DELAY = ref(500);

  const messages = ref<Message[]>([]);
  const userPreferences = ref<UserPreferences>({
    servings: 2,
    recipeType: '',
    dietaryRestrictions: [],
    cookingTime: 30,
    skillLevel: 'Beginner',
    cuisine: '',
  });

  const kiwiMessageState = ref<KiwiMessageState>('start');
  const disableChatbox = computed(() => kiwiMessageState.value === 'searching');
  const newMessage = ref('');
  const scrollArea = ref<QScrollArea | null>(null);

  const recipeStore = useRecipeStore();

  function scrollToBottom() {
    nextTick(() => {
      if (scrollArea.value) {
        const scrollTarget = scrollArea.value.getScrollTarget();
        scrollArea.value.setScrollPosition('vertical', scrollTarget.scrollHeight, 550);
      }
    });
  }

  function sendKiwiMessage(message: Omit<Message, 'id' | 'sender' | 'sent'>) {
    const kiwiMessage: Message = {
      id: messages.value.length + 1,
      sender: 'Kiwi',
      sent: false,
      ...message,
    } as Message;

    setTimeout(() => {
      messages.value.push(kiwiMessage);
      scrollToBottom();
    }, KIWI_DELAY.value);
  }

  const askQuestions = {
    askForServings: () => {
      sendKiwiMessage({
        type: 'text',
        content: 'How many people are you cooking for today?',
      });
      sendKiwiMessage({
        type: 'options',
        content: ['1', '2', '3', '4', '5+'],
      });
    },
    askForRecipeType: () => {
      sendKiwiMessage({
        type: 'text',
        content: 'What type of recipe are you in the mood for?',
      });
      sendKiwiMessage({
        type: 'options',
        content: ['Quick & Easy', 'Healthy', 'Comfort Food', 'Gourmet', 'Budget-friendly'],
      });
    },
    askForDietaryRestrictions: () => {
      sendKiwiMessage({
        type: 'text',
        content: 'Do you have any dietary restrictions or preferences? (Select all that apply)',
      });
      sendKiwiMessage({
        type: 'multiOptions',
        content: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low-carb', 'None'],
      });
    },
    askForCookingTime: () => {
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
    },
    askForCuisine: () => {
      sendKiwiMessage({
        type: 'text',
        content: 'Any particular cuisine you\'re craving?',
      });
      sendKiwiMessage({
        type: 'options',
        content: ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Surprise me!'],
      });
    },
  };

  async function searchRecipes() {
    kiwiMessageState.value = 'searching';
    sendKiwiMessage({
      type: 'text',
      content: 'Great! Let me find some recipes that match your preferences...',
    });

    try {
      const recipes = await recipeStore.searchRecipe(newMessage.value);
      kiwiMessageState.value = 'displayingResults';

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
      kiwiMessageState.value = 'start';
    }
  }

  function resetChat() {
    messages.value = [];
    userPreferences.value = {
      servings: 2,
      recipeType: '',
      dietaryRestrictions: [],
      cookingTime: 30,
      skillLevel: 'Beginner',
      cuisine: '',
    };
    kiwiMessageState.value = 'start';
    sendKiwiMessage({
      type: 'text',
      content: 'Let\'s start over! What would you like to cook today?',
    });
    askQuestions.askForServings();
  }

  function handleUserInput(input: string) {
    const stateHandlers: Record<KiwiMessageState, (input: string) => void> = {
      start: (_input) => {
        userPreferences.value.servings = parseInt(_input, 10);
        kiwiMessageState.value = 'recipeType';
        askQuestions.askForRecipeType();
      },
      recipeType: (_input) => {
        userPreferences.value.recipeType = _input;
        kiwiMessageState.value = 'dietaryRestrictions';
        askQuestions.askForDietaryRestrictions();
      },
      dietaryRestrictions: () => {
        kiwiMessageState.value = 'cookingTime';
        askQuestions.askForCookingTime();
      },
      cookingTime: () => {
        // This state is handled by the slider change event
      },
      cuisine: (_input) => {
        userPreferences.value.cuisine = _input;
        searchRecipes();
      },
      searching: () => {
        // Do nothing while searching
      },
      displayingResults: (_input) => {
        if (_input === 'See more recipes') {
          searchRecipes();
        } else if (_input === 'Start cooking') {
          // Implement logic to start cooking selected recipe
        } else if (_input === 'New search') {
          resetChat();
        }
      },
    };

    const handler = stateHandlers[kiwiMessageState.value];
    if (handler) {
      handler(input);
    }
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

    handleUserInput(text);
  }

  function handleOptionClick(option: string, type: MessageType) {
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
    askQuestions.askForCuisine();
  }

  onMounted(() => {
    sendKiwiMessage({
      type: 'text',
      content: 'Hey there! 🥝 Welcome to KiwiCook, your personal cooking assistant! Ready to whip up something delicious?',
    });
    askQuestions.askForServings();
  });

  return {
    KIWI_DELAY,
    messages,
    userPreferences,
    kiwiMessageState,
    disableChatbox,
    newMessage,
    scrollArea,
    sendUserMessage,
    handleOptionClick,
    handleSliderChange,
    resetChat,
  };
}
