import {
  computed, nextTick, onMounted, ref,
} from 'vue';
import { QScrollArea } from 'quasar';
import { useRecipeStore } from 'stores/recipe-store.ts';
import { KiwiMessageState, Message, MessageType } from 'src/models/chat.ts';
import { createUserPreference, createUserPreferenceArray, UserPreferences } from 'src/models/search.ts';

export function useChat() {
  // Constants
  const KIWI_DELAY_MS = 500;
  const DEFAULT_PREFERENCES: UserPreferences = {
    servings: createUserPreference(2),
    recipeType: createUserPreference(''),
    dietaryRestrictions: createUserPreferenceArray([], 'all'),
    cookingTime: createUserPreference(30),
    skillLevel: createUserPreference('Beginner'),
    cuisine: createUserPreference(''),
    tags: createUserPreferenceArray([], 'all'),
  };

  // Reactive state
  const messages = ref<Message[]>([]);
  const userPreferences = ref<UserPreferences>({ ...DEFAULT_PREFERENCES });
  const kiwiMessageState = ref<KiwiMessageState>('start');
  const isChatDisabled = computed(() => kiwiMessageState.value === 'searching');
  const newMessage = ref('');
  const scrollArea = ref<QScrollArea | null>(null);

  const recipeStore = useRecipeStore();

  // Utility: Scroll chat to bottom
  const scrollToBottom = () => {
    nextTick(() => {
      if (scrollArea.value) {
        const scrollTarget = scrollArea.value.getScrollTarget();
        scrollArea.value.setScrollPosition('vertical', scrollTarget.scrollHeight, 550);
      }
    });
  };

  // Utility: Add a message with delay
  const addMessage = (message: Omit<Message, 'id' | 'sender' | 'sent'>, sender = 'Kiwi') => {
    setTimeout(() => {
      messages.value.push({
        id: messages.value.length + 1,
        sender,
        sent: sender === 'You',
        ...message,
      } as Message);
      scrollToBottom();
    }, KIWI_DELAY_MS);
  };

  // Encapsulated question asking logic
  const questions = {
    ask: (text: string, options: string[] | null = null) => {
      addMessage({ type: 'text', content: text });
      if (options) {
        addMessage({ type: 'options', content: options });
      }
    },
    servings: () => questions.ask(
      'How many people are you cooking for today?',
      ['1', '2', '3', '4', '5+'],
    ),
    recipeType: () => questions.ask(
      'What type of recipe are you in the mood for?',
      ['Quick & Easy', 'Healthy', 'Comfort Food', 'Gourmet', 'Budget-friendly'],
    ),
    dietaryRestrictions: () => questions.ask(
      'Do you have any dietary restrictions?',
      ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low-carb', 'None'],
    ),
    cookingTime: () => addMessage({
      type: 'slider',
      content: {
        label: 'Cooking time (in minutes)',
        value: 30,
        min: 15,
        max: 120,
        step: 15,
      },
    }),
    cuisine: () => questions.ask(
      'Any particular cuisine you\'re craving?',
      ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Surprise me!'],
    ),
  };

  // Recipe search logic
  const searchRecipes = async () => {
    kiwiMessageState.value = 'searching';
    const content = [
      `${userPreferences.value.servings.property} servings`,
      `${userPreferences.value.recipeType.property.toLowerCase()} type`,
      `${userPreferences.value.cookingTime.property} minutes cooking time`,
      `${userPreferences.value.cuisine.property} cuisine.`,
    ];
    const contentString = `${content.slice(0, -1).join(', ')} and ${content.slice(-1)}`;

    addMessage({
      type: 'text',
      content: `Searching for recipes with ${contentString}`,
    });

    try {
      const recipes = await recipeStore.searchByPreferences(userPreferences.value);
      kiwiMessageState.value = 'displayingResults';

      if (recipes.length === 0) {
        addMessage({ type: 'text', content: 'No matching recipes found. Try broadening your criteria.' });
        addMessage({ type: 'options', content: ['Yes, broaden search', 'No, start over'] });
      } else {
        addMessage({ type: 'text', content: 'Here are some recipes for you:' });
        addMessage({ type: 'recipe', content: recipes });
        addMessage({ type: 'options', content: ['See more recipes', 'Start cooking', 'New search'] });
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      addMessage({ type: 'text', content: 'An error occurred while searching. Try again?' });
      kiwiMessageState.value = 'start';
    }
  };

  // Reset the chat and preferences
  const resetChat = () => {
    messages.value = [];
    userPreferences.value = { ...DEFAULT_PREFERENCES };
    kiwiMessageState.value = 'start';
    addMessage({ type: 'text', content: 'Let\'s start over. What would you like to cook today?' });
    questions.servings();
  };

  // Handle each phase of the conversation
  const handleState = (input: string) => {
    const transitions: Record<KiwiMessageState, () => void> = {
      start: () => {
        userPreferences.value.servings.property = parseInt(input, 10);
        kiwiMessageState.value = 'recipeType';
        questions.recipeType();
      },
      recipeType: () => {
        userPreferences.value.recipeType.property = input;
        kiwiMessageState.value = 'dietaryRestrictions';
        questions.dietaryRestrictions();
      },
      dietaryRestrictions: () => {
        // Update dietary restrictions, move on to cooking time
        kiwiMessageState.value = 'cookingTime';
        questions.cookingTime();
      },
      cookingTime: () => {
        // Cooking time handled in slider callback, move on to cuisine
      },
      cuisine: () => {
        userPreferences.value.cuisine.property = input;
        searchRecipes();
      },
      searching: () => {
        // No user input handled during searching
      },
      displayingResults: () => {
        if (input === 'See more recipes') {
          searchRecipes();
        }
        if (input === 'New search') {
          resetChat();
        }
      },
    };

    transitions[kiwiMessageState.value]?.();
  };

  // Handle slider input (asynchronous)
  const handleSliderInput = (value: number) => {
    userPreferences.value.cookingTime.property = value;
    addMessage({ type: 'text', content: `Looking for recipes that take about ${value} minutes to prepare.` });
    kiwiMessageState.value = 'cuisine';
    questions.cuisine();
  };

  // Process user input
  const handleUserInput = (input: string) => {
    if (!input.trim()) {
      return;
    }
    addMessage({ type: 'text', content: input }, 'You');
    handleState(input);
  };

  // Handle user sending a message
  const sendUserMessage = (text: string = newMessage.value) => {
    if (!text.trim()) {
      return;
    }
    newMessage.value = '';
    handleUserInput(text);
  };

  // Handle multi-option click
  const handleOptionClick = (option: string, type: MessageType) => {
    if (type === 'multiOptions') {
      if (newMessage.value.includes(option)) {
        newMessage.value = newMessage.value.replace(option, '').trim();
      } else {
        newMessage.value += ` ${option}`;
      }
    } else {
      sendUserMessage(option);
    }
  };

  // On component mount, initialize the chat
  onMounted(() => {
    addMessage({ type: 'text', content: 'Hey there! 🥝 Welcome to KiwiCook, your personal cooking assistant!' });
    questions.servings();
  });

  return {
    messages,
    userPreferences,
    kiwiMessageState,
    isChatDisabled,
    newMessage,
    scrollArea,
    sendUserMessage,
    handleOptionClick,
    handleSliderInput,
    resetChat,
  };
}
