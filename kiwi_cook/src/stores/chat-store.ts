import { defineStore } from 'pinia';
import { computed, nextTick, ref } from 'vue';
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
  const lastMessage = computed(() => messages.value[messages.value.length - 1] || {});
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
  const currentId = computed(() => messages.value.length + 1);

  // Computed properties
  const preferencesToSummary = (preferences: UserPreferences) => {
    trackEvent('preferences_selected', { preferences });

    return [
      t('search.servings', { count: preferences.servings }),
      t('search.recipeType', { type: preferences.recipeType.toLowerCase() }),
      t('search.cookingTime', { time: preferences.cookingTime }),
      t('search.cuisine', { cuisine: preferences.cuisine }),
    ].join(', ');
  };

  // Methods
  const addMessage = async (message: Partial<Message>, sender = 'Kiwi') => {
    const newMessage: Message = {
      id: currentId.value,
      sender,
      sent: sender === t('chat.you'),
      timestamp: toTime(new Date()),
      ...message,
    } as Message;
    messages.value.push(newMessage);
    await nextTick();
  };

  const searchRecipes = async () => {
    isTyping.value = true;

    try {
      const recipes = await recipeStore.searchByPreferences(userPreferences.value);
      currentRecipes.value = recipes;

      if (recipes.length === 0) {
        currentState.value = 'noResults';
        processCurrentState();
        return;
      }
      await addMessage({ type: 'recipe', content: recipes });

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
          [t('servings.5plus')]: undefined,
        });

        const mapOptionToServings = getServingsMapping();
        userPreferences.value.servings = mapOptionToServings[input];
        trackEvent('servings_selected', { servings: userPreferences.value.servings });
      },
    },
    askRecipeType: {
      message: t('chat.recipeType'),
      options: ts(['recipeType.quick', 'recipeType.healthy', 'recipeType.comfort', 'recipeType.gourmet', 'recipeType.budget']),
      nextState: 'askDietaryRestrictions',
      updatePreference: (input: string | number) => {
        const getRecipeTypeMappings = () => ({
          [t('recipeType.quick')]: 'quick',
          [t('recipeType.healthy')]: 'healthy',
          [t('recipeType.comfort')]: 'comfort',
          [t('recipeType.gourmet')]: 'gourmet',
          [t('recipeType.budget')]: 'budget',
        });

        const mapOptionToType = getRecipeTypeMappings();
        userPreferences.value.recipeType = mapOptionToType[input];
        trackEvent('recipe_type_selected', { recipeType: userPreferences.value.recipeType });
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
        unit: t('recipe.minutes'),
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
      message: () => t('search.searching', { preferences: preferencesToSummary(userPreferences.value) }),
      nextState: 'displayingResults',
      action: searchRecipes,
    },
    noResults: {
      message: t('search.noResults'),
      options: ts(['search.moreOptions', 'search.newSearch']),
      nextState: (input: string | number) => {
        if (input === 'search.moreOptions') {
          return 'askServings';
        }
        return 'resetChat';
      },
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
      message: t('chat.weekPlan.askDays'),
      type: 'slider',
      sliderOptions: {
        min: 1,
        max: 14,
        step: 1,
        unit: (input: number) => (input === 1 ? t('chat.days', 1) : t('chat.days', 2)),
      },
      nextState: 'generatePlan',
      action: generateWeekPlan,
    },
    resetChat: {
      message: t('chat.reset'),
      action: resetChat,
      nextState: 'start',
    },
  };

  async function processCurrentState() {
    trackEvent('chat_state_changed', { state: currentState.value });
    const currentConfig = chatConfig[currentState.value];

    if (currentConfig.message) {
      // message can be a function, especially for dynamic messages

      const message = typeof currentConfig.message === 'function' ? currentConfig.message() : currentConfig.message;
      await addMessage({ type: 'text', content: message });
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
    trackEvent('chat_message_received', { message: input });
    const currentConfig = chatConfig[currentState.value];

    if (currentConfig.updatePreference) {
      currentConfig.updatePreference(input);
    }

    await addMessage({ type: 'text', content: input.toString() }, t('chat.you'));

    if (currentConfig.nextState) {
      const nextState = typeof currentConfig.nextState === 'function'
        ? currentConfig.nextState(input.toString())
        : currentConfig.nextState;

      currentState.value = nextState;
    }
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
    lastMessage,
    userPreferences,
    currentState,
    isTyping,
    currentRecipes,
    newInput,
    currentId,
    handleMessage,
    handleSliderInput,
    resetChat,
  };
});
