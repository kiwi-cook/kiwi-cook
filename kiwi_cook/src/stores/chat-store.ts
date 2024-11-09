import { defineStore } from 'pinia';
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRecipeStore } from 'stores/recipe-store';
import { useNotification } from 'src/composables/useNotification';
import { useAnalytics } from 'src/composables/useAnalytics';
import { toTime } from 'src/utils/time';
import {
  ChatConfig, ChatState, Message, SliderMessage,
} from 'src/models/chat';
import { Recipe } from 'src/models/recipe';
import { UserPreferences } from 'src/models/user';
import { ts } from 'src/utils/i18n';
import { useWeekplan } from 'src/composables/useWeekplan';
import { Meal, MealPlan } from 'src/models/mealplan';

export const useChatStore = defineStore('chat', () => {
  const { t } = useI18n();
  const weekplan = useWeekplan();
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
    cookingTime: 15,
    skillLevel: 'Beginner',
    cuisine: '',
    tags: [],
    weekplanDays: 7,
    ingredients: [],
  });
  const lastState = ref('');
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

  const kiwiTypes = async (duration: number) => {
    isTyping.value = true;
    // Fake typing
    await new Promise((resolve) => { setTimeout(resolve, duration); });
    isTyping.value = false;
  };

  const searchRecipes = async () => {
    try {
      const recipes = await recipeStore.searchByPreferences(userPreferences.value);
      await kiwiTypes(1000);
      currentRecipes.value = recipes;

      if (recipes.length === 0) {
        await updateState('findRecSNoResults');
        return;
      }
      await addMessage({ type: 'recipe', content: recipes });

      trackEvent('recipes_searched', { count: recipes.length });
    } catch (error) {
      await addMessage({ type: 'text', content: t('search.error') });
      trackEvent('recipes_search_error', { error });
      showNotification('error', t('search.errorNotification'));
      await updateState('start');
    } finally {
      isTyping.value = false;
    }
  };

  const generateWeekPlan = async () => {
    const generatedWeekplan = weekplan.generateRandomWeekplan(userPreferences.value.weekplanDays);
    await kiwiTypes(1000);

    generatedWeekplan.forEach((plan: MealPlan) => {
      const day = plan.date.getDay();

      const recipes = plan.meals.map((meal: Meal) => meal.recipe);
      addMessage({ type: 'text', content: t(`plan.weekdays.${day}`) });
      addMessage({ type: 'recipe', content: recipes });
    });
  };

  /**
   * Chat and state configuration
   *
   * States to find recipes:
   * 1. start: Initial state
   * 2. findRecQServings: Ask user for servings
   * 3. findRecQRecipeType: Ask user for recipe type
   * 4. findRecQDietaryRestrictions: Ask user for dietary restrictions
   * 5. findRecQCookingTime: Ask user for cooking time
   * 6. findRecQCuisine: Ask user for cuisine
   * 7. findRecASearch: Searching for recipes
   *
   * States to generate weekly plan:
   * 1. genPlanQWeekDays: Ask user for number of days
   * 2. genPlanQIngredients: Ask user for ingredients: input or take image
   * 3. genPlanAPlan: Generate weekly plan
   *
   */
  const chatConfig: ChatConfig = {
    start: {
      nextState: 'checkStatusRecipes',
    },
    checkStatusRecipes: {
      message: t('chat.status.recipes.checking'),
      action: async () => {
        await recipeStore.fetchRecipes();
        if (recipeStore.recipes.length === 0) {
          await addMessage({ type: 'text', content: t('chat.status.recipes.failed') });
        } else {
          await removeLastMessages(2);
          await updateState('welcome');
        }
      },
    },
    welcome: {
      message: t('introduction.welcome'),
      options: ts(['chat.actions.optionFindRecipe', 'chat.actions.optionGenerateWeeklyPlan']),
      nextState: (input: string) => {
        switch (input) {
          case t('chat.actions.optionFindRecipe'):
            return 'findRecQServings';
          case t('chat.actions.optionGenerateWeeklyPlan'):
            return 'genPlanQWeekDays';
          default:
            return 'start';
        }
      },
    },
    findRecQServings: {
      message: t('search.questions.servings'),
      options: ts(['filters.servings.1', 'filters.servings.2', 'filters.servings.3', 'filters.servings.4', 'filters.servings.5plus']),
      nextState: 'findRecQRecipeType',
      updatePreference: (input: string | number) => {
        const getServingsMapping = () => ({
          [t('filters.servings.1')]: 1,
          [t('filters.servings.2')]: 2,
          [t('filters.servings.3')]: 3,
          [t('filters.servings.4')]: 4,
          [t('filters.servings.5plus')]: undefined,
        });

        const mapOptionToServings = getServingsMapping();
        userPreferences.value.servings = mapOptionToServings[input];
        trackEvent('servings_selected', { servings: userPreferences.value.servings });
      },
    },
    findRecQRecipeType: {
      message: t('search.questions.recipeType'),
      options: ts(['filters.recipeType.dontCare', 'filters.recipeType.quick', 'filters.recipeType.healthy',
        'filters.recipeType.comfort', 'filters.recipeType.gourmet', 'filters.recipeType.budget']),
      nextState: 'findRecQDietaryRestrictions',
      updatePreference: (input: string | number) => {
        const getRecipeTypeMappings = () => ({
          [t('filters.recipeType.dontCare')]: '',
          [t('filters.recipeType.quick')]: 'quick',
          [t('filters.recipeType.healthy')]: 'healthy',
          [t('filters.recipeType.comfort')]: 'comfort',
          [t('filters.recipeType.gourmet')]: 'gourmet',
          [t('filters.recipeType.budget')]: 'budget',
        });

        const mapOptionToType = getRecipeTypeMappings();
        userPreferences.value.recipeType = mapOptionToType[input];
        trackEvent('recipe_type_selected', { recipeType: userPreferences.value.recipeType });
      },
    },
    findRecQDietaryRestrictions: {
      message: t('search.questions.dietaryRestrictions'),
      options: ts(['filters.dietary.none',
        'filters.dietary.vegetarian',
        'filters.dietary.vegan',
        'filters.dietary.glutenFree',
        'filters.dietary.dairyFree',
        'filters.dietary.lowCarb',
      ]),
      nextState: 'findRecQCookingTime',
      updatePreference: (input: string | number) => {
        userPreferences.value.dietaryRestrictions = (input as string).split(',').map((item) => item.trim());
      },
    },
    findRecQCookingTime: {
      message: t('search.questions.cookingTime'),
      type: 'slider',
      sliderOptions: {
        min: 10,
        max: 120,
        step: 10,
        unit: t('recipe.minutes'),
      },
      nextState: 'findRecASearch',
      updatePreference: (input: string | number) => {
        userPreferences.value.cookingTime = input as number;
      },
    },
    findRecQCuisine: {
      message: t('search.questions.cuisine'),
      options: ts(['cuisine.italian', 'cuisine.mexican', 'cuisine.asian', 'cuisine.mediterranean', 'cuisine.american', 'cuisine.surprise']),
      nextState: 'findRecASearch',
      updatePreference: (input: string | number) => {
        userPreferences.value.cuisine = input as string;
      },
    },
    findRecASearch: {
      message: () => t('search.results.searching', { preferences: preferencesToSummary(userPreferences.value) }),
      nextState: 'findRecAResults',
      action: searchRecipes,
    },
    findRecSNoResults: {
      message: t('search.results.noResults'),
      options: ts(['search.actions.moreOptions', 'search.actions.newSearch']),
      nextState: (input: string | number) => {
        if (input === 'search.actions.moreOptions') {
          return 'findRecQServings';
        }
        return 'globAReset';
      },
    },
    findRecAResults: {
      message: t('search.results.found'),
      options: ts(['search.actions.moreOptions', 'search.actions.startCooking', 'search.actions.newSearch']),
      nextState: (input: string) => {
        switch (input) {
          case 'search.actions.moreOptions':
            return 'findRecQCuisine';
          case 'search.actions.startCooking':
            return 'start';
          case 'search.actions.newSearch':
            return 'globAReset';
          default:
            return 'findRecAResults';
        }
      },
    },
    genPlanQWeekDays: {
      message: t('plan.questions.days'),
      type: 'slider',
      sliderOptions: {
        min: 1,
        max: 14,
        step: 1,
        unit: (input: number) => (input === 1 ? t('chat.days', 1) : t('chat.days', 2)),
      },
      nextState: 'genPlanQIngredients',
      updatePreference: (input: string | number) => {
        userPreferences.value.weekplanDays = input as number;
      },
    },
    genPlanQIngredients: {
      message: t('plan.questions.ingredients'),
      nextState: 'genPlan',
      updatePreference: (input: string | number) => {
        userPreferences.value.ingredients = (input as string).split(',').map((item) => item.trim());
      },
    },
    genPlan: {
      message: () => t('plan.status.generating', { preferences: preferencesToSummary(userPreferences.value) }),
      action: generateWeekPlan,
    },
    globAReset: {
      message: t('chat.reset'),
      action: resetChat,
      nextState: 'start',
    },
  };

  async function handleCurrentState() {
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
          value: Math.round(currentConfig?.sliderOptions ? (currentConfig.sliderOptions.max - currentConfig.sliderOptions.min) / 2 : 0),
          ...currentConfig.sliderOptions,
        },
      } as SliderMessage);
    }

    if (currentConfig.action) {
      await currentConfig.action();
    }

    // If there is no message or options, we go to the next state
    if (!currentConfig.message && !currentConfig.options && currentConfig.nextState) {
      const nextState = typeof currentConfig.nextState === 'function'
        ? currentConfig.nextState(newInput.value)
        : currentConfig.nextState;

      trackEvent('chat_state_changed', { state: nextState });
      await updateState(nextState);
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
      await updateState(nextState);
    }
  }

  async function updateState(newState: ChatState) {
    lastState.value = currentState.value;
    currentState.value = newState;
    if (currentState.value === lastState.value) {
      throw new Error(`Invalid next state: ${newState}`);
    }

    return handleCurrentState();
  }

  async function removeLastMessages(amount = 1) {
    messages.value = messages.value.slice(0, -amount);
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
      weekplanDays: 7,
      ingredients: [],
    };
    currentRecipes.value = [];
    await addMessage({ type: 'text', content: t('chat.reset') });
    await updateState('start');
    trackEvent('chat_reset');
  }

  // Initialization
  const initializeChat = async () => handleCurrentState();

  // Call initializeChat when the store is created
  initializeChat();

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
    globAReset: resetChat,
  };
});
