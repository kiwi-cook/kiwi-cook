import {
  computed, nextTick, onMounted, ref, watch,
} from 'vue';
import { QScrollArea } from 'quasar';
import { useRecipeStore } from 'stores/recipe-store';
import {
  ChatHistory,
  isMessageOption,
  KiwiMessageState,
  Message,
  messageFromOptions,
  MessageOption,
  MessageType,
} from 'src/models/chat';
import {
  createUserPreference, createUserPreferenceArray, PreferenceValue, UserPreferences,
} from 'src/models/search';
import { useI18n } from 'vue-i18n';
import { defineStore } from 'pinia';
import { getTranslation, Recipe } from 'src/models/recipe';
import { useNotification } from 'src/composables/useNotification';
import { useAnalytics } from 'src/composables/useAnalytics';
import { toTime } from 'src/utils/time.ts';

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
  const isChatDisabled = ref(false);
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
    isChatDisabled.value = message.disableChat || false;
    setTimeout(() => {
      const newMessage: Message = {
        id: messages.value.length + 1,
        sender,
        sent: sender === 'You',
        timestamp: toTime(new Date()),
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

  const actions = {
    ask: async (text: string, message: Omit<Message, 'id' | 'sender' | 'sent' | 'timestamp'>) => {
      await addMessage({ type: 'text', content: text });
      await addMessage(message);
    },

    // Get recipe suggestions
    askStartOptions: () => actions.ask('Was möchtest du tun?', messageFromOptions([
      {
        label: t('chat.optionFindRecipe'),
        mapping: () => {
          kiwiMessageState.value = 'askServings';
          actions.askServings();
        },
      },
      {
        label: t('chat.optionGenerateWeeklyPlan'),
        mapping: () => {
          kiwiMessageState.value = 'generateWeeklyPlan';
          actions.generateWeekplan();
        },
      },
    ], false, true)),
    askServings: () => actions.ask(t('chat.servings'), messageFromOptions([{
      label: t('servings.1'),
      mapping: 1,
    }, {
      label: t('servings.2'),
      mapping: 2,
    }, {
      label: t('servings.3'),
      mapping: 3,
    }, {
      label: t('servings.4'),
      mapping: 4,
    }, {
      label: t('servings.5plus'),
      mapping: '5plus',
    }])),
    // eslint-disable-next-line max-len
    askRecipeType: () => actions.ask(t('chat.recipeType'), messageFromOptions(
      [t('recipeType.quick'), t('recipeType.healthy'), t('recipeType.comfort'), t('recipeType.gourmet'), t('recipeType.budget')],
      true,
      false,
    )),
    // eslint-disable-next-line max-len
    askDietaryRestrictions: () => actions.ask(t('chat.dietaryRestrictions'), messageFromOptions(
      [t('dietary.vegetarian'), t('dietary.vegan'), t('dietary.glutenFree'), t('dietary.dairyFree'), t('dietary.lowCarb'), t('dietary.none')],
    )),
    askCookingTime: () => addMessage({
      type: 'slider',
      content: {
        label: t('chat.cookingTime'),
        value: 30,
        min: 15,
        max: 120,
        step: 15,
        unit: t('chat.minutes'),
      },
      disableChat: true,
    }),
    // eslint-disable-next-line max-len
    askCuisine: () => actions.ask(t('chat.cuisine'), messageFromOptions([t('cuisine.italian'), t('cuisine.mexican'), t('cuisine.asian'), t('cuisine.mediterranean'), t('cuisine.american'), t('cuisine.surprise')])),

    // Generate weekplan
    generateWeekplan: () => actions.ask('Wie viele Rezepte möchtest du für die Woche planen?', messageFromOptions(['3', '5', '7'])),
    resetChat: async () => {
      messages.value = [];
      userPreferences.value = { ...DEFAULT_PREFERENCES };
      kiwiMessageState.value = 'start';
      currentRecipes.value = [];
      await addMessage({ type: 'text', content: t('chat.reset') });
      await actions.askStartOptions();
      trackEvent('chat_reset');
    },
    searchRecipes: async () => {
      kiwiMessageState.value = 'searching';
      await addMessage({ type: 'text', content: t('search.searching', { preferences: preferencesSummary.value }) });

      try {
        await simulateTyping();
        const recipes = await recipeStore.searchByPreferences(userPreferences.value);
        currentRecipes.value = recipes;
        recipeNames.value = recipes.map((recipe) => getTranslation(recipe.name));
        kiwiMessageState.value = 'displayingResults';

        if (recipes.length === 0) {
          await addMessage({ type: 'text', content: t('search.noResults') });
          await addMessage({
            type: 'options',
            content: [{ label: t('search.startOver'), mapping: () => actions.resetChat() }],
          });
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
    },
  };

  // State handlers
  const stateHandlers: Record<KiwiMessageState, (input: string) => Promise<void>> = {
    start: async () => {
    },
    generateWeeklyPlan: async () => {
    },
    askServings: async (input) => {
      userPreferences.value.servings.property = parseInt(input, 10);
      kiwiMessageState.value = 'askRecipeType';
      await actions.askRecipeType();
    },
    askRecipeType: async (input) => {
      userPreferences.value.recipeType.property = input;
      kiwiMessageState.value = 'askDietaryRestrictions';
      await actions.askDietaryRestrictions();
    },
    askDietaryRestrictions: async (input) => {
      userPreferences.value.dietaryRestrictions.property = input.split(',').map((item) => item.trim());
      kiwiMessageState.value = 'askCookingTime';
      await actions.askCookingTime();
    },
    askCookingTime: async () => {
      // Handled by slider newInput
    },
    cuisine: async (input) => {
      userPreferences.value.cuisine.property = input;
      await actions.searchRecipes();
    },
    searching: async () => {
      // No user newInput handled during searching
    },
    displayingResults: async (input) => {
      if (input.toLowerCase() === t('search.moreOptions').toLowerCase()) {
        await actions.askCuisine();
      } else if (input.toLowerCase() === t('search.startCooking').toLowerCase()) {
        await addMessage({ type: 'text', content: t('search.enjoyYourMeal') });
        kiwiMessageState.value = 'start';
      } else if (input.toLowerCase() === t('search.newSearch').toLowerCase()) {
        await actions.resetChat();
      }
    },
    displayMoreResults: async () => {
      await actions.searchRecipes();
    },
    startingOver: async () => {
      await actions.resetChat();
    },
  };

  const handleState = async (input: string) => {
    const handler = stateHandlers[kiwiMessageState.value];
    console.log('kiwiMessageState:', kiwiMessageState.value);
    if (handler) {
      await handler(input);
    } else {
      console.error(`No handler for state: ${kiwiMessageState.value}`);
    }
  };

  const handleSliderInput = async (value: number) => {
    userPreferences.value.cookingTime.property = value;
    kiwiMessageState.value = 'cuisine';
    await actions.askCuisine();
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

  const handleTextInput = async (text: string = newInput.value) => {
    newInput.value = '';
    await handleUserInput(text);
  };

  const handleOptionClick = async (option: MessageOption | string, type: MessageType) => {
    if (isMessageOption(option)) {
      // If the option is a callback, call it
      if (typeof option.mapping === 'function') {
        await handleUserInput(option.label);
        option.mapping();
        return;
      }
    }

    const optionMapping = isMessageOption(option) ? option.mapping.toString() : option;
    const optionLabel = isMessageOption(option) ? option.label : option;

    if (type === 'multiOptions') {
      newInput.value = newInput.value.includes(optionLabel)
        ? newInput.value
          .replace(optionLabel, '') // Remove the option
          // .replace(`, ${optionLabel}`, '') // Remove the option with a comma
          .trim()
        : `${newInput.value} ${optionLabel}`.trim();
      console.log('newInput.value:', newInput.value);
    } else {
      await handleUserInput(optionMapping);
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
    // Initialize recipeNames with some popular recipes
    recipeNames.value = recipeStore.recipes.slice(0, 5).map((recipe: Recipe) => getTranslation(recipe.name));

    await addMessage({ type: 'text', content: t('chat.welcome') });
    await actions.askStartOptions();
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
    handleTextInput,
    handleOptionClick,
    handleSliderInput,
    saveChat,
    loadChat,
    exportChat,
    importChat,
    updatePreference,
  };
});
