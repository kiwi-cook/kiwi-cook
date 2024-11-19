import { defineStore } from 'pinia';
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRecipeStore } from 'stores/recipe-store';
import { useNotification } from 'src/composables/useNotification';
import { useAnalytics } from 'src/composables/useAnalytics';
import { formatDate, toTime } from 'src/utils/time';
import {
  ChatConfig, ChatState, Message, SliderMessage,
} from 'src/models/chat';
import { UserPreferences } from 'src/models/user';
import { ts } from 'src/utils/i18n';
import { useWeekplan } from 'src/composables/useWeekplan';
import { Meal, MealPlan } from 'src/models/mealplan';
import { getTranslation } from 'src/models/recipe';
import { useLocalStorage } from 'src/composables/useLocalStorage';

export const useChatStore = defineStore('chat', () => {
  const { t } = useI18n();
  const weekplan = useWeekplan();
  const recipeStore = useRecipeStore();
  const { showNotification } = useNotification();
  const { trackEvent } = useAnalytics();
  const customStorage = useLocalStorage();

  // Chat state
  const messages = ref<Message[]>([]);
  const lastMessage = computed(
    () => messages.value[messages.value.length - 1] || {},
  );
  const messageId = computed(() => messages.value.length + 1);
  const previousState = ref('');
  const currentState = ref<ChatState>('start');
  const isTyping = ref(false);

  // User state and preferences
  const userInput = ref<string>('');
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
  const preferencesToSummary = (preferences: UserPreferences) => {
    trackEvent('preferences_selected', { preferences });

    return [
      t(`filters.servings.${preferences.servings}`),
      t(`filters.recipeType.${preferences.recipeType}`),
      preferences.dietaryRestrictions.join(', '),
      t('filters.cookingTime', { time: preferences.cookingTime }),
    ].join(', ');
  };

  // Methods
  function saveChat() {
    const statesAndAnswers = messages.value
      .filter((message) => message.sent)
      .map((message) => ({
        state: message.state,
        userContent: message.content.toString(),
      }));
    customStorage.saveData('chat', statesAndAnswers);
  }

  async function initChat() {
    // Load the chat from local storage
    const uncheckedMessages = customStorage.loadData('chat') as {
      state: ChatState;
      userContent: string,
    }[];
    if (uncheckedMessages) {
      await updateState(uncheckedMessages[0].state, true, true);
      await uncheckedMessages.reduce(async (promiseChain, message) => {
        // Wait for the previous promise in the chain to resolve
        await promiseChain;
        // Process the current message
        await handleMessage(message.userContent, false);
      }, Promise.resolve());
    } else {
      handleCurrentState();
    }
  }

  async function updateState(newState: ChatState, doHandleCurrentState = true, ignoreError = false) {
    previousState.value = currentState.value;
    currentState.value = newState;
    if (currentState.value === previousState.value && !ignoreError) {
      throw new Error(`Invalid next state: ${newState}`);
    }

    if (doHandleCurrentState) {
      return handleCurrentState();
    }

    return Promise.resolve();
  }

  const addMessage = async (message: Partial<Message>, sender = 'Kiwi', save = false) => {
    const newMessage: Message = {
      id: messageId.value,
      sender,
      sent: sender === t('chat.you'),
      timestamp: toTime(new Date()),
      state: currentState.value,
      ...message,
    } as Message;
    messages.value.push(newMessage);
    if (save) {
      saveChat();
    }
    await nextTick();
  };

  function removeLastMessages(amount = 1) {
    messages.value = messages.value.slice(0, -amount);
  }

  function editMessage(id: number) {
    // Reset the message to this state
    const index = messages.value.findIndex((message) => message.id === id);
    if (index === -1) {
      return;
    }

    // Go back to the previous state
    const messagePreviousState = messages.value[index].state;
    removeLastMessages(messages.value.length - index);
    updateState(messagePreviousState, false);
  }

  const kiwiTypes = async (duration: number) => {
    isTyping.value = true;
    // Fake typing
    await new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
    isTyping.value = false;
  };

  const searchRecipes = async () => {
    try {
      const recipes = await recipeStore.searchByPreferences(
        userPreferences.value,
      );
      await kiwiTypes(1000);

      if (recipes.length === 0) {
        await updateState('findRecSNoResults');
        return;
      }
      await addMessage({ type: 'recipe', content: recipes });
      await updateState('findRecAResults');

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
    const generatedWeekplan = weekplan.generateRandomWeekplan(
      userPreferences.value.weekplanDays,
    );
    await kiwiTypes(1000);

    generatedWeekplan.forEach((plan: MealPlan) => {
      const recipes = plan.meals.map((meal: Meal) => meal.recipe);
      addMessage({ type: 'text', content: formatDate(plan.date) });
      addMessage({ type: 'recipe', content: recipes });
    });
  };

  /**
   * Chat and state configuration
   *
   * States to find recipes:
   * 1. start: Initial state
   * 2. findRecQServings: Ask user for servings
   * 3. findRecQRecipeType: Ask user for recipe messageType
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
          await addMessage({
            type: 'text',
            content: t('chat.status.recipes.failed'),
          });
        } else {
          await removeLastMessages(2);
          await updateState('welcome');
        }
      },
    },
    welcome: {
      message: t('introduction.welcome'),
      optionsConfig: ts([
        'chat.actions.optionFindRecipe',
        'chat.actions.optionGenerateWeeklyPlan',
      ]),
      nextState: (input: string) => {
        switch (input) {
          case t('chat.actions.optionFindRecipe'):
            return 'findRecOType';
          case t('chat.actions.optionGenerateWeeklyPlan'):
            return 'genPlanQWeekDays';
          default:
            return 'start';
        }
      },
    },
    findRecOType: {
      message: t('search.options.type'),
      optionsConfig: ts([
        'search.options.byQuery',
        'search.options.byQuestions',
      ]),
      nextState: (input: string) => {
        switch (input) {
          case t('search.options.byQuery'):
            return 'findRecFQuery';
          case t('search.options.byQuestions'):
            return 'findRecQServings';
          default:
            return 'start';
        }
      },
    },
    findRecFQuery: {
      message: t('search.query.action'),
      suggestionsConfig: {
        suggestions: (input: string) => Array.from(
          new Set(
            recipeStore.recipes
              .map((recipe) => getTranslation(recipe.name))
              .filter((name) => name.toLowerCase().includes(input.toLowerCase())),
          ),
        ).slice(0, 5),
        withSubmit: false,
        placeholder: t('search.query.placeholder'),
        notFoundText: t('search.query.noResults'),
      },
      onInput: (input: string | number) => {
        // Route to the recipe if it exists
        const recipe = recipeStore.recipes.find(
          (r) => getTranslation(r.name).toLowerCase()
            === (input as string).toLowerCase(),
        );

        if (recipe) {
          // If there is already a recipe message, remove it
          if (lastMessage.value.type === 'recipe') {
            removeLastMessages();
          }
          addMessage({ type: 'recipe', content: [recipe] });
          trackEvent('recipe_found', { recipe });
          // router.push(`/recipe/${recipe.id}`);
        }
      },
      noMessage: true,
    },
    findRecQServings: {
      message: t('search.questions.servings'),
      optionsConfig: ts([
        'filters.servings.1',
        'filters.servings.2',
        'filters.servings.3',
        'filters.servings.4',
        'filters.servings.5plus',
      ]),
      nextState: 'findRecQRecipeType',
      onInput: (input: string | number) => {
        const getServingsMapping = () => ({
          [t('filters.servings.1')]: 1,
          [t('filters.servings.2')]: 2,
          [t('filters.servings.3')]: 3,
          [t('filters.servings.4')]: 4,
          [t('filters.servings.5plus')]: undefined,
        });

        const mapOptionToServings = getServingsMapping();
        userPreferences.value.servings = mapOptionToServings[input];
        trackEvent('servings_selected', {
          servings: userPreferences.value.servings,
        });
      },
    },
    findRecQRecipeType: {
      message: t('search.questions.recipeType'),
      optionsConfig: ts([
        'filters.recipeType.dontCare',
        'filters.recipeType.quick',
        'filters.recipeType.healthy',
        'filters.recipeType.comfort',
        'filters.recipeType.gourmet',
        'filters.recipeType.budget',
      ]),
      nextState: 'findRecQDietaryRestrictions',
      onInput: (input: string | number) => {
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
        trackEvent('recipe_type_selected', {
          recipeType: userPreferences.value.recipeType,
        });
      },
    },
    findRecQDietaryRestrictions: {
      message: t('search.questions.dietaryRestrictions'),
      optionsConfig: ts([
        'filters.dietary.none',
        'filters.dietary.vegetarian',
        'filters.dietary.vegan',
        'filters.dietary.glutenFree',
        'filters.dietary.dairyFree',
        'filters.dietary.lowCarb',
      ]),
      nextState: 'findRecQCookingTime',
      onInput: (input: string | number) => {
        userPreferences.value.dietaryRestrictions = (input as string)
          .split(',')
          .map((item) => item.trim());
      },
    },
    findRecQCookingTime: {
      message: t('search.questions.cookingTime'),
      messageType: 'slider',
      sliderConfig: {
        min: 10,
        max: 120,
        step: 10,
        unit: t('recipe.minutes'),
      },
      nextState: 'findRecASearch',
      onInput: (input: string | number) => {
        userPreferences.value.cookingTime = input as number;
      },
    },
    findRecQCuisine: {
      message: t('search.questions.cuisine'),
      optionsConfig: ts([
        'cuisine.italian',
        'cuisine.mexican',
        'cuisine.asian',
        'cuisine.mediterranean',
        'cuisine.american',
        'cuisine.surprise',
      ]),
      nextState: 'findRecASearch',
      onInput: (input: string | number) => {
        userPreferences.value.cuisine = input as string;
      },
    },
    findRecASearch: {
      message: () => t('search.results.searching', {
        preferences: preferencesToSummary(userPreferences.value),
      }),
      action: searchRecipes,
    },
    findRecSNoResults: {
      message: t('search.results.noResults'),
      optionsConfig: ts([
        'search.actions.moreOptions',
        'search.actions.newSearch',
      ]),
      nextState: (input: string | number) => {
        if (input === t('search.actions.moreOptions')) {
          return 'findRecQServings';
        }
        return 'globAReset';
      },
    },
    findRecAResults: {
      message: t('search.results.found'),
      optionsConfig: ts([
        'search.actions.moreOptions',
        'search.actions.newSearch',
      ]),
      nextState: (input: string) => {
        switch (input) {
          case t('search.actions.moreOptions'):
            return 'findRecQCuisine';
          case t('search.actions.newSearch'):
            return 'globAReset';
          default:
            return 'findRecAResults';
        }
      },
    },
    genPlanQWeekDays: {
      message: t('plan.questions.days'),
      messageType: 'slider',
      sliderConfig: {
        min: 1,
        max: 14,
        step: 1,
        unit: (input: number) => t('units.date.days', { count: input }),
      },
      nextState: 'genPlanQIngredients',
      onInput: (input: string | number) => {
        userPreferences.value.weekplanDays = input as number;
      },
    },
    genPlanQIngredients: {
      message: t('plan.questions.ingredients'),
      suggestionsConfig: {
        suggestions: (input: string) => Array.from(
          new Set(
            recipeStore.ingredients.filter((ingredient) => ingredient.toLowerCase().includes(input.toLowerCase())),
          ),
        ).slice(0, 5),
        withSubmit: true,
        placeholder: t('plan.ingredients.placeholder'),
        submitText: t('plan.ingredients.submit'),
      },
      onInput: (input: string | number) => {
        if (input === t('plan.ingredients.submit')) {
          addMessage(
            { type: 'text', content: t('plan.ingredients.submit') },
            t('chat.you'),
          );
          updateState('genPlanAPlan');
          return;
        }

        // if input is already in the list, remove it
        if (userPreferences.value.ingredients.includes(input as string)) {
          userPreferences.value.ingredients = userPreferences.value.ingredients.filter((item) => item !== input);
        } else {
          userPreferences.value.ingredients.push(input as string);
        }

        if (userPreferences.value.ingredients.length === 0) {
          removeLastMessages(1);
          return;
        }

        if (lastMessage.value.sender === t('chat.you')) {
          removeLastMessages();
        }
        addMessage(
          {
            type: 'text',
            content: userPreferences.value.ingredients.join(', '),
          },
          t('chat.you'),
        );
      },
      noMessage: true,
    },
    genPlanAPlan: {
      message: () => t('plan.status.generating', {
        preferences: preferencesToSummary(userPreferences.value),
      }),
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
      const message = typeof currentConfig.message === 'function'
        ? currentConfig.message()
        : currentConfig.message;
      await addMessage({ type: 'text', content: message });
    }

    if (currentConfig.optionsConfig) {
      await addMessage({
        type: 'options',
        content: currentConfig.optionsConfig,
      });
    }

    if (currentConfig.sliderConfig) {
      if (!currentConfig.message) {
        throw new Error('Slider messageType requires a message');
      }

      await addMessage({
        type: 'slider',
        content: {
          label: currentConfig.message,
          value: Math.round(
            currentConfig?.sliderConfig
              ? (currentConfig.sliderConfig.max
                  - currentConfig.sliderConfig.min)
                  / 2
              : 0,
          ),
          ...currentConfig.sliderConfig,
        },
      } as SliderMessage);
    } else if (currentConfig.suggestionsConfig) {
      await addMessage({
        ...currentConfig.suggestionsConfig,
        type: 'suggestion',
        content: currentConfig.suggestionsConfig.suggestions,
      });
    }

    if (currentConfig.action) {
      await currentConfig.action();
    }

    // If there is no message or optionsConfig, we go to the next state
    if (
      !currentConfig.message
      && !currentConfig.optionsConfig
      && currentConfig.nextState
    ) {
      const nextState = typeof currentConfig.nextState === 'function'
        ? currentConfig.nextState(userInput.value)
        : currentConfig.nextState;

      trackEvent('chat_state_changed', { state: nextState });
      await updateState(nextState);
    }
  }

  async function handleMessage(input: string | number, save = true) {
    trackEvent('chat_message_received', { message: input });
    const currentConfig = chatConfig[currentState.value];
    trackEvent('current_config', { currentConfig });

    if (currentConfig.onInput) {
      currentConfig.onInput(input);
    }

    if (currentConfig.noMessage) {
      return;
    }

    await addMessage(
      { type: 'text', content: input.toString() },
      t('chat.you'),
      save,
    );

    if (currentConfig.nextState) {
      trackEvent('chat_state_changed', { state: currentConfig.nextState });
      const nextState = typeof currentConfig.nextState === 'function'
        ? currentConfig.nextState(input.toString())
        : currentConfig.nextState;
      await updateState(nextState);
    } else {
      trackEvent('chat_state_changed', { state: 'no_next_state' });
    }
  }

  async function resetChat() {
    userInput.value = '';
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
    await addMessage({ type: 'text', content: t('chat.reset') });
    await updateState('start');
    trackEvent('chat_reset');
  }

  // Load the chat from local storage
  initChat();

  return {
    messages,
    lastMessage,
    userPreferences,
    currentState,
    isTyping,
    userInput,
    messageId,
    handleMessage,
    editMessage,
    resetChat,
  };
});
