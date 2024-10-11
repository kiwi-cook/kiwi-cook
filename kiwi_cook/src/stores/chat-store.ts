import { defineStore } from 'pinia';
import {
  computed, nextTick, ref, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRecipeStore } from 'stores/recipe-store';
import { useNotification } from 'src/composables/useNotification';
import { useAnalytics } from 'src/composables/useAnalytics';
import { toTime } from 'src/utils/time';
import {
  ChatConfig, ChatState, Message, SliderMessage,
} from 'src/models/chat.ts';
import { Recipe } from 'src/models/recipe.ts';
import { UserPreferences } from 'src/models/user.ts';
import { ts } from 'src/utils/i18n.ts';

export const useChatStore = defineStore('chat', () => {
  const { t } = useI18n();
  const recipeStore = useRecipeStore();
  const { showNotification } = useNotification();
  const { trackEvent } = useAnalytics();

  // State
  const messages = ref<Message[]>([]);
  const userPreferences = ref<UserPreferences>({
    servings: 2,
    recipeType: '',
    dietaryRestrictions: [],
    cookingTime: 30,
    skillLevel: 'Beginner',
    cuisine: '',
    tags: [],
  });
  const currentState = ref<ChatState>('start');
  const isTyping = ref(false);
  const currentRecipes = ref<Recipe[]>([]);
  const newInput = ref<string>('');
  const shadowInput = ref<string>('');

  // Computed properties
  const preferencesSummary = computed(() => {
    const prefs = userPreferences.value;
    return [
      t('search.servings', { count: prefs.servings }),
      t('search.recipeType', { type: prefs.recipeType.toLowerCase() }),
      t('search.cookingTime', { time: prefs.cookingTime }),
      t('search.cuisine', { cuisine: prefs.cuisine }),
    ].join(', ');
  });

  // Methods
  const addMessage = async (message: Partial<Message>, sender = 'Kiwi') => {
    const newMessage: Message = {
      id: messages.value.length + 1,
      sender,
      sent: sender === 'You',
      timestamp: toTime(new Date()),
      ...message,
    } as Message;
    messages.value.push(newMessage);
    await nextTick();
  };

  const searchRecipes = async () => {
    isTyping.value = true;
    await addMessage({ type: 'text', content: t('search.searching', { preferences: preferencesSummary.value }) });

    try {
      const recipes = await recipeStore.searchByPreferences(userPreferences.value);
      currentRecipes.value = recipes;

      if (recipes.length === 0) {
        await addMessage({ type: 'text', content: t('search.noResults') });
        currentState.value = 'resetChat';
      } else {
        await addMessage({ type: 'recipe', content: recipes });
      }

      trackEvent('recipes_searched', { count: recipes.length });
    } catch (error) {
      console.error('Error searching recipes:', error);
      await addMessage({ type: 'text', content: t('search.error') });
      showNotification('error', t('search.errorNotification'));
      currentState.value = 'start';
    } finally {
      isTyping.value = false;
    }
  };

  // Watchers
  watch(newInput, (value) => {
    if (value.trim() === '') {
      shadowInput.value = '';
    }
  });

  const generateWeekPlan = async () => {
    // Implementation for generating a weekly plan
    // This is a placeholder and should be implemented based on your specific requirements
    await addMessage({ type: 'text', content: t('chat.weekPlanGenerated') });
    currentState.value = 'start';
  };

  // Chat configuration
  const chatConfig: ChatConfig = {
    start: {
      message: t('chat.welcome'),
      options: ts(['chat.optionFindRecipe', 'chat.optionGenerateWeeklyPlan']),
      nextState: (input: string) => {
        switch (input) {
          case t('chat.optionFindRecipe'):
            return 'askServings';
          case t('chat.optionGenerateWeeklyPlan'):
            return 'generatePlan';
          default:
            return 'start';
        }
      },
    },
    askServings: {
      message: t('chat.servings'),
      options: ts(['servings.1', 'servings.2', 'servings.3', 'servings.4', 'servings.5plus']),
      nextState: 'askRecipeType',
      updatePreference: (input: string | number) => {
        const getServingsMapping = () => ({
          [t('servings.1')]: 1,
          [t('servings.2')]: 2,
          [t('servings.3')]: 3,
          [t('servings.4')]: 4,
          [t('servings.5plus')]: 5,
        });

        const mapOptionToServings = getServingsMapping();
        if (typeof input === 'string') {
          userPreferences.value.servings = mapOptionToServings[t(input)] || 2; // Default to 2 servings
        } else {
          userPreferences.value.servings = input;
        }
      },
    },
    askRecipeType: {
      message: t('chat.recipeType'),
      options: ts(['recipeType.quick', 'recipeType.healthy', 'recipeType.comfort', 'recipeType.gourmet', 'recipeType.budget']),
      nextState: 'askDietaryRestrictions',
      updatePreference: (input: string | number) => {
        userPreferences.value.recipeType = input as string;
      },
    },
    askDietaryRestrictions: {
      message: t('chat.dietaryRestrictions'),
      options: ts(['dietary.vegetarian', 'dietary.vegan', 'dietary.glutenFree', 'dietary.dairyFree', 'dietary.lowCarb', 'dietary.none']),
      nextState: 'askCookingTime',
      updatePreference: (input: string | number) => {
        userPreferences.value.dietaryRestrictions = (input as string).split(',').map((item) => item.trim());
      },
    },
    askCookingTime: {
      message: t('chat.cookingTime'),
      type: 'slider',
      sliderOptions: {
        min: 15,
        max: 120,
        step: 15,
        unit: 'minutes',
      },
      nextState: 'askCuisine',
      updatePreference: (input: string | number) => {
        userPreferences.value.cookingTime = input as number;
      },
    },
    askCuisine: {
      message: t('chat.cuisine'),
      options: ts(['cuisine.italian', 'cuisine.mexican', 'cuisine.asian', 'cuisine.mediterranean', 'cuisine.american', 'cuisine.surprise']),
      nextState: 'searching',
      updatePreference: (input: string | number) => {
        userPreferences.value.cuisine = input as string;
      },
    },
    searching: {
      message: t('search.searching'),
      nextState: 'displayingResults',
      action: searchRecipes,
    },
    displayingResults: {
      message: t('search.results'),
      options: ts(['search.moreOptions', 'search.startCooking', 'search.newSearch']),
      nextState: (input: string) => {
        if (input === 'search.moreOptions') {
          return 'askCuisine';
        }
        if (input === 'search.startCooking') {
          return 'start';
        }
        if (input === 'search.newSearch') {
          return 'resetChat';
        }
        return 'displayingResults';
      },
    },
    generatePlan: {
      message: t('chat.weeklyPlanOptions'),
      options: ['3', '5', '7'],
      nextState: 'generatePlan',
      action: generateWeekPlan,
    },
    resetChat: {
      action: resetChat,
      nextState: 'start',
    },
  };

  async function processCurrentState() {
    const currentConfig = chatConfig[currentState.value];
    console.log('Processing state:', currentState.value);

    if (currentConfig.message) {
      await addMessage({ type: 'text', content: currentConfig.message });
    }

    if (currentConfig.options) {
      await addMessage({
        type: 'options',
        content: currentConfig.options,
      });
    }

    if (currentConfig.type === 'slider') {
      if (!currentConfig.message) {
        throw new Error('Slider type requires a message');
      }

      await addMessage({
        type: 'slider',
        content: {
          label: currentConfig.message,
          value: 30,
          ...currentConfig.sliderOptions,
        },
      } as SliderMessage);
    }

    if (currentConfig.action) {
      await currentConfig.action();
    }
  }

  async function handleMessage(input: string | number) {
    const currentConfig = chatConfig[currentState.value];
    console.log('Current state:', currentState.value);

    if (currentConfig.updatePreference) {
      currentConfig.updatePreference(input);
    }

    await addMessage({ type: 'text', content: input.toString() }, 'You');

    const nextState = typeof currentConfig.nextState === 'function'
      ? currentConfig.nextState(input.toString())
      : currentConfig.nextState;

    currentState.value = nextState;
    await processCurrentState();
  }

  async function resetChat() {
    messages.value = [];
    userPreferences.value = {
      servings: 2,
      recipeType: '',
      dietaryRestrictions: [],
      cookingTime: 30,
      skillLevel: 'Beginner',
      cuisine: '',
      tags: [],
    };
    currentRecipes.value = [];
    await addMessage({ type: 'text', content: t('chat.reset') });
    currentState.value = 'start';
    await processCurrentState();
    trackEvent('chat_reset');
  }

  const handleSliderInput = async (value: number) => {
    userPreferences.value.cookingTime = value;
    await handleMessage(value);
  };

  // Initialization
  const init = async () => processCurrentState();

  // Call init when the store is created
  init();

  return {
    messages,
    userPreferences,
    currentState,
    isTyping,
    currentRecipes,
    newInput,
    shadowInput,
    handleMessage,
    handleSliderInput,
    resetChat,
  };
});
