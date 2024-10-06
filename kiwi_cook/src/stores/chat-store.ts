import {
  computed, nextTick, onMounted, ref, watch,
} from 'vue';
import { QScrollArea } from 'quasar';
import { useRecipeStore } from 'stores/recipe-store';
import {
  ChatHistory, isMessageOption, KiwiMessageState, Message, MessageOption, MessageType,
} from 'src/models/chat';
import {
  createUserPreference, createUserPreferenceArray, PreferenceValue, UserPreferences,
} from 'src/models/search';
import { useI18n } from 'vue-i18n';
import { defineStore } from 'pinia';
import { getTranslation, Recipe } from 'src/models/recipe';
import { useNotification } from 'src/composables/useNotification';
import { useAnalytics } from 'src/composables/useAnalytics';

export const useChatStore = defineStore('chat', () => {
  const { t } = useI18n();
  const recipeStore = useRecipeStore();
  const { showNotification } = useNotification();
  const { trackEvent } = useAnalytics();

  // Constants
  const KIWI_DELAY_MS = 200;
  const MAX_CHAT_HISTORY = 50;
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
  const newInput = ref<string>('');
  const shadowInput = ref<string>('');
  const scrollArea = ref<QScrollArea | null>(null);
  const chatHistory = ref<ChatHistory[]>([]);
  const isTyping = ref(false);
  const currentRecipes = ref<Recipe[]>([]);
  const currentOptions = ref<(MessageOption | string)[]>([]);
  const recipeNames = ref<string[]>([]);

  // Computed properties
  const preferencesSummary = computed(() => {
    const prefs = userPreferences.value;
    return [
      t('search.servings', { count: prefs.servings.property }),
      t('search.recipeType', { type: prefs.recipeType.property.toLowerCase() }),
      t('search.cookingTime', { time: prefs.cookingTime.property }),
      t('search.cuisine', { cuisine: prefs.cuisine.property }),
    ].join(', ');
  });
  // eslint-disable-next-line max-len
  const autocompleteOptions = computed(() => [...currentOptions.value.map((opt) => (typeof opt === 'string' ? opt : opt.label)), ...recipeNames.value]);

  // Watchers
  watch(messages, (newMessages) => {
    if (newMessages.length > MAX_CHAT_HISTORY) {
      messages.value = newMessages.slice(-MAX_CHAT_HISTORY);
    }
  });

  watch(newInput, (value) => {
    if (value.trim() === '') {
      shadowInput.value = '';
      return;
    }

    const lowerValue = value.toLowerCase();
    const matchingOption = autocompleteOptions.value.find((opt: string) => opt.toLowerCase().startsWith(lowerValue));

    if (matchingOption) {
      shadowInput.value = matchingOption;
    } else {
      shadowInput.value = '';
    }
  });

  // Utility functions
  const scrollToBottom = () => nextTick(() => {
    if (scrollArea.value) {
      const scrollTarget = scrollArea.value.getScrollTarget();
      const duration = isTyping.value ? 0 : KIWI_DELAY_MS - 100;
      scrollArea.value.setScrollPosition('vertical', scrollTarget.scrollHeight, duration);
    }
  });

  const addMessage = async (message: Omit<Message, 'id' | 'sender' | 'sent' | 'timestamp'>, sender = 'Kiwi') => new Promise<void>((resolve) => {
    setTimeout(() => {
      const newMessage: Message = {
        id: messages.value.length + 1,
        sender,
        sent: sender === 'You',
        timestamp: new Date().toISOString(),
        ...message,
      } as Message;
      messages.value.push(newMessage);

      // Update currentOptions if the message contains options
      if (message.type === 'options') {
        currentOptions.value = message.content as (MessageOption | string)[];
      }

      scrollToBottom();
      resolve();
    }, sender === 'You' ? 0 : KIWI_DELAY_MS);
  });

  const simulateTyping = async (duration: number = 1000) => {
    isTyping.value = true;
    await new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
    isTyping.value = false;
  };

  // Questions
  const questions = {
    ask: async (text: string, options: MessageOption[] | string[] | null = null) => {
      await simulateTyping();
      await addMessage({ type: 'text', content: text });
      if (options) {
        await addMessage({ type: 'options', content: options });
      }
    },
    servings: () => questions.ask(t('chat.servings'), [t('servings.1'), t('servings.2'), t('servings.3'), t('servings.4'), t('servings.5plus')]),
    // eslint-disable-next-line max-len
    recipeType: () => questions.ask(t('chat.recipeType'), [t('recipeType.quick'), t('recipeType.healthy'), t('recipeType.comfort'), t('recipeType.gourmet'), t('recipeType.budget')]),
    // eslint-disable-next-line max-len
    dietaryRestrictions: () => questions.ask(t('chat.dietaryRestrictions'), [t('dietary.vegetarian'), t('dietary.vegan'), t('dietary.glutenFree'), t('dietary.dairyFree'), t('dietary.lowCarb'), t('dietary.none')]),
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
    // eslint-disable-next-line max-len
    cuisine: () => questions.ask(t('chat.cuisine'), [t('cuisine.italian'), t('cuisine.mexican'), t('cuisine.asian'), t('cuisine.mediterranean'), t('cuisine.american'), t('cuisine.surprise')]),
  };

  // Chat actions
  const resetChat = async () => {
    messages.value = [];
    userPreferences.value = { ...DEFAULT_PREFERENCES };
    kiwiMessageState.value = 'start';
    currentRecipes.value = [];
    await addMessage({ type: 'text', content: t('chat.reset') });
    await questions.servings();
    trackEvent('chat_reset');
  };

  const searchRecipes = async () => {
    kiwiMessageState.value = 'searching';
    await addMessage({ type: 'text', content: t('search.searching', { preferences: preferencesSummary.value }) });

    try {
      await simulateTyping(2000);
      const recipes = await recipeStore.searchByPreferences(userPreferences.value);
      currentRecipes.value = recipes;
      recipeNames.value = recipes.map((recipe) => getTranslation(recipe.name));
      kiwiMessageState.value = 'displayingResults';

      if (recipes.length === 0) {
        await addMessage({ type: 'text', content: t('search.noResults') });
        await addMessage({ type: 'options', content: [{ label: t('search.startOver'), callback: resetChat }] });
      } else {
        await addMessage({ type: 'text', content: t('search.results') });
        await addMessage({ type: 'recipe', content: recipes });
        await addMessage({
          type: 'options',
          content: [t('search.moreOptions'), t('search.startCooking'), t('search.newSearch')],
        });
      }
      trackEvent('recipes_searched', { count: recipes.length });
    } catch (error) {
      console.error('Error searching recipes:', error);
      await addMessage({ type: 'text', content: t('search.error') });
      showNotification('error', t('search.errorNotification'));
      kiwiMessageState.value = 'start';
    }
  };

  // State handlers
  const stateHandlers: Record<KiwiMessageState, (input: string) => Promise<void>> = {
    start: async (input) => {
      userPreferences.value.servings.property = parseInt(input, 10);
      kiwiMessageState.value = 'recipeType';
      await questions.recipeType();
    },
    recipeType: async (input) => {
      userPreferences.value.recipeType.property = input;
      kiwiMessageState.value = 'dietaryRestrictions';
      await questions.dietaryRestrictions();
    },
    dietaryRestrictions: async (input) => {
      userPreferences.value.dietaryRestrictions.property = input.split(',').map((item) => item.trim());
      kiwiMessageState.value = 'cookingTime';
      await questions.cookingTime();
    },
    cookingTime: async () => {
      // Handled by slider newInput
    },
    cuisine: async (input) => {
      userPreferences.value.cuisine.property = input;
      await searchRecipes();
    },
    searching: async () => {
      // No user newInput handled during searching
    },
    displayingResults: async (input) => {
      if (input.toLowerCase() === t('search.moreOptions').toLowerCase()) {
        await questions.cuisine();
      } else if (input.toLowerCase() === t('search.startCooking').toLowerCase()) {
        await addMessage({ type: 'text', content: t('search.enjoyYourMeal') });
        kiwiMessageState.value = 'start';
      } else if (input.toLowerCase() === t('search.newSearch').toLowerCase()) {
        await resetChat();
      }
    },
    displayMoreResults: async () => {
      await searchRecipes();
    },
    startingOver: async () => {
      await resetChat();
    },
  };

  const handleState = async (input: string) => {
    const handler = stateHandlers[kiwiMessageState.value];
    if (handler) {
      await handler(input);
    } else {
      console.error(`No handler for state: ${kiwiMessageState.value}`);
    }
  };

  const handleSliderInput = async (value: number) => {
    userPreferences.value.cookingTime.property = value;
    kiwiMessageState.value = 'cuisine';
    await questions.cuisine();
  };

  const handleUserInput = async (userInput: string) => {
    if (!userInput.trim()) {
      return;
    }

    // If there's a shadow message and the newInput ends with Tab, use the autocompleted value
    if (shadowInput.value && userInput.endsWith('\t')) {
      userInput = shadowInput.value;
      newInput.value = userInput;
    }

    await addMessage({ type: 'text', content: userInput }, 'You');
    await handleState(userInput);
    trackEvent('user_message_sent');

    // Reset shadow message after sending
    shadowInput.value = '';
  };

  const sendUserMessage = async (text: string = newInput.value) => {
    if (!text.trim()) {
      return;
    }

    // If there's a shadow message and the user pressed Tab, use the autocompleted value
    if (shadowInput.value && text.endsWith('\t')) {
      newInput.value = shadowInput.value;
      return;
    }

    newInput.value = '';
    await handleUserInput(text);
  };

  const handleOptionClick = async (option: MessageOption | string, type: MessageType) => {
    if (isMessageOption(option)) {
      option.callback();
      return;
    }

    if (type === 'multiOptions') {
      newInput.value = newInput.value.includes(option)
        ? newInput.value.replace(option, '').trim()
        : `${newInput.value} ${option}`.trim();
    } else {
      await sendUserMessage(option);
    }
  };

  const saveChat = () => {
    const history: ChatHistory = {
      timestamp: new Date().toISOString(),
      messages: messages.value,
      preferences: userPreferences.value,
    };
    chatHistory.value.push(history);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory.value));
  };

  const loadChat = (index: number) => {
    if (index >= 0 && index < chatHistory.value.length) {
      const history = chatHistory.value[index];
      messages.value = history.messages;
      userPreferences.value = history.preferences;
      kiwiMessageState.value = 'displayingResults';
    }
  };

  const exportChat = () => {
    const chatData = {
      messages: messages.value,
      preferences: userPreferences.value,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_export_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importChat = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const chatData = JSON.parse(e.target?.result as string);
        messages.value = chatData.messages;
        userPreferences.value = chatData.preferences;
        kiwiMessageState.value = 'displayingResults';
        showNotification('success', t('chat.importSuccess'));
      } catch (error) {
        console.error('Error importing chat:', error);
        showNotification('error', t('chat.importError'));
      }
    };
    reader.readAsText(file);
  };

  const updatePreference = <T extends keyof UserPreferences>(
    key: T,
    value: PreferenceValue<UserPreferences[T]['type']>,
  ) => {
    userPreferences.value[key].property = value;
  };

  onMounted(async () => {
    /* const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
      chatHistory.value = JSON.parse(storedHistory);
    } */

    // Initialize recipeNames with some popular recipes
    recipeNames.value = recipeStore.recipes.slice(0, 5).map((recipe: Recipe) => getTranslation(recipe.name));

    await addMessage({ type: 'text', content: t('chat.welcome') });
    await questions.servings();
  });

  return {
    messages,
    userPreferences,
    kiwiMessageState,
    isChatDisabled,
    newInput,
    shadowInput,
    scrollArea,
    isTyping,
    currentRecipes,
    chatHistory,
    preferencesSummary,
    sendUserMessage,
    handleOptionClick,
    handleSliderInput,
    resetChat,
    saveChat,
    loadChat,
    exportChat,
    importChat,
    updatePreference,
  };
});
