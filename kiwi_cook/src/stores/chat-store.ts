import {
  computed, nextTick, onMounted, ref,
} from 'vue';
import { QScrollArea } from 'quasar';
import { useRecipeStore } from 'stores/recipe-store.ts';
import {
  KiwiMessageState, Message, MessageType, MessageOption, isMessageOption,
} from 'src/models/chat.ts';
import { createUserPreference, createUserPreferenceArray, UserPreferences } from 'src/models/search.ts';
import { useI18n } from 'vue-i18n';
import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', () => {
  const { t } = useI18n(); // Add this line to use i18n

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
        scrollArea.value.setScrollPosition('vertical', scrollTarget.scrollHeight, KIWI_DELAY_MS - 100);
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
    }, sender === 'You' ? 0 : KIWI_DELAY_MS);
  };

  // Encapsulated question asking logic
  const questions = {
    ask: (text: string, options: MessageOption[] | string[] | null = null) => {
      addMessage({ type: 'text', content: text });
      if (options) {
        addMessage({ type: 'options', content: options });
      }
    },
    servings: () => questions.ask(
      t('chat.servings'),
      [t('servings.1'), t('servings.2'), t('servings.3'), t('servings.4'), t('servings.5plus')],
    ),
    recipeType: () => questions.ask(
      t('chat.recipeType'),
      [t('recipeType.quick'), t('recipeType.healthy'), t('recipeType.comfort'), t('recipeType.gourmet'), t('recipeType.budget')],
    ),
    dietaryRestrictions: () => questions.ask(
      t('chat.dietaryRestrictions'),
      [t('dietary.vegetarian'), t('dietary.vegan'), t('dietary.glutenFree'), t('dietary.dairyFree'), t('dietary.lowCarb'), t('dietary.none')],
    ),
    cookingTime: () => addMessage({
      type: 'slider',
      content: {
        label: t('chat.cookingTime'),
        value: 30,
        min: 15,
        max: 120,
        step: 15,
        unit: t('chat.minutes'),
      },
    }),
    cuisine: () => questions.ask(
      t('chat.cuisine'),
      [t('cuisine.italian'), t('cuisine.mexican'), t('cuisine.asian'), t('cuisine.mediterranean'), t('cuisine.american'), t('cuisine.surprise')],
    ),
  };

  // Reset the chat and preferences
  const resetChat = () => {
    messages.value = [];
    userPreferences.value = { ...DEFAULT_PREFERENCES };
    kiwiMessageState.value = 'start';
    addMessage({ type: 'text', content: t('chat.reset') });
    questions.servings();
  };

  // Recipe search logic
  const searchRecipes = async () => {
    kiwiMessageState.value = 'searching';
    const content = [
      t('search.servings', { count: userPreferences.value.servings.property }),
      t('search.recipeType', { type: userPreferences.value.recipeType.property.toLowerCase() }),
      t('search.cookingTime', { time: userPreferences.value.cookingTime.property }),
      t('search.cuisine', { cuisine: userPreferences.value.cuisine.property }),
    ];
    const contentString = t('search.summary', { content: content.join(', ') });

    addMessage({
      type: 'text',
      content: t('search.searching', { preferences: contentString }),
    });

    try {
      const recipes = await recipeStore.searchByPreferences(userPreferences.value);
      kiwiMessageState.value = 'displayingResults';

      if (recipes.length === 0) {
        addMessage({ type: 'text', content: t('search.noResults') });
        addMessage({
          type: 'options',
          content: [
            {
              label: t('search.startOver'),
              callback: () => resetChat(),
            },
          ],
        });
      } else {
        addMessage({ type: 'text', content: t('search.results') });
        addMessage({ type: 'recipe', content: recipes });
        addMessage({
          type: 'options',
          content: [t('search.moreOptions'), t('search.startCooking'), t('search.newSearch')],
        });
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      addMessage({ type: 'text', content: t('search.error') });
      kiwiMessageState.value = 'start';
    }
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
        searchRecipes();
      },
      displayMoreResults: () => {
        searchRecipes();
      },
      startingOver: () => {
        resetChat();
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
  const handleOptionClick = (option: MessageOption | string, type: MessageType) => {
    if (isMessageOption(option)) {
      option.callback();
      return;
    }

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
    addMessage({ type: 'text', content: t('chat.welcome') });
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
});
