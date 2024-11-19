export default {
  app: {
    tagline: 'Your personal cooking assistant',
  },

  // Core app sections
  introduction: {
    title: 'Welcome to the Kiwi Kitchen!',
    subtitle: 'Your personal cooking assistant',
    welcome:
      'Welcome to the Kiwi Kitchen! 🥝 I am your cooking assistant and I help you discover delicious recipes.',
    start: 'Get Started',
  },

  // Chat interface
  chat: {
    you: 'You',
    kiwi: 'Kiwi',
    actions: {
      optionFindRecipe: 'Find recipe',
      optionGenerateWeeklyPlan: 'Create weekly plan',
      reset: 'Alright, let’s start over. What would you like to cook today?',
    },
    status: {
      recipes: {
        checking: 'Loading recipes...',
        failed:
          'Sorry, I couldn’t retrieve any recipes. Please try again later.',
      },
    },
    input: {
      label: 'What would you like to cook?',
      placeholder: 'For example: Spaghetti Carbonara',
    },
  },

  // Recipe search related
  search: {
    questions: {
      servings: 'How many people would you like to cook for?',
      recipeType: 'What type of dish are you looking for?',
      dietaryRestrictions: 'Are there any special dietary requests?',
      cookingTime: 'How much time would you like to allocate for cooking?',
      cuisine: 'What cuisine do you prefer today?',
      lastQuestion: 'Finally: ',
    },
    results: {
      searching:
        'Great! I am now searching for recipes based on your preferences: {preferences}',
      noResults:
        'Unfortunately, I couldn’t find any suitable recipes. Should we adjust the search?',
      found: 'Here are some suitable suggestions for you:',
      error: 'Oops! Something went wrong. Would you like to try again?',
    },
    actions: {
      broaden: 'Adjust search',
      startOver: 'Start anew',
      moreOptions: 'More recipes',
      startCooking: 'Start cooking',
      newSearch: 'New search',
    },
  },

  // Recipe categories and filters
  filters: {
    recipeType: {
      dontCare: 'Doesn’t matter',
      quick: 'Quick and easy',
      healthy: 'Healthy and balanced',
      comfort: 'Comfort food',
      gourmet: 'Special dishes',
      budget: 'Cheap and tasty',
    },
    dietary: {
      none: 'No restrictions',
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      glutenFree: 'Gluten-free',
      dairyFree: 'Lactose-free',
      lowCarb: 'Low carb',
    },
    cuisine: {
      italian: 'Italian',
      mexican: 'Mexican',
      asian: 'Asian',
      mediterranean: 'Mediterranean',
      american: 'American',
      surprise: 'Surprise me!',
    },
    servings: {
      1: 'One person',
      2: 'Two people',
      3: 'Three people',
      4: 'Four people',
      '5plus': 'Five or more people',
    },
  },

  // Meal planning
  plan: {
    meals: {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
    },
    questions: {
      days: 'For how many days would you like to create a plan?',
      ingredients: 'What ingredients do you already have at home?',
      shoppingList: 'Should I create a shopping list?',
      scanFridge: 'Would you like to scan your fridge?',
    },
    status: {
      generating: 'I am creating your weekly plan. One moment please...',
      planFor: 'Your weekly plan for {days} days:',
      noIngredients:
        'Unfortunately, I can’t find any suitable recipes. Should we adjust the requirements?',
    },
    weekdays: {
      0: 'Monday',
      1: 'Tuesday',
      2: 'Wednesday',
      3: 'Thursday',
      4: 'Friday',
      5: 'Saturday',
      6: 'Sunday',
    },
    ingredients: {
      nothing: 'Nothing',
      submit: 'Done',
      placeholder: 'For example: tomatoes, onions, garlic',
    },
  },

  // Recipe details
  recipe: {
    servings: 'Servings',
    minutes: 'Minutes',
    ingredients: 'Ingredients',
    steps: 'Preparation steps',
  },

  // Shopping list
  shopping: {
    addToList: 'Add to shopping list',
  },

  login: {
    title: 'Log in with your Kiwi account',
    username: 'Username',
    password: 'Password',
    keepSignedIn: 'Keep me signed in',
    forgotPassword: 'Forgot password?',
    signUp: 'Register now!',
  },

  // Error handling
  error: {
    notFound: 'Oops! 🥝 We can’t find this recipe. Please choose another one!',
    backToHome: 'Back to homepage',
  },

  // Common units
  units: {
    minutes: 'Minute | Minutes',
    days: 'Day | Days',
  },
};
