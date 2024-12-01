 
export default {
  app: {
    tagline: 'Your Personal Cooking Assistant',
  },

  // Core app sections
  introduction: {
    title: 'Welcome to Kiwi Kitchen!',
    subtitle: 'Your Personal Cooking Assistant',
    welcome:
      'Welcome to Kiwi Kitchen! 🥝 I am your cooking assistant and I will help you discover delicious recipes.',
    start: 'Get Started',
  },

  // Chat interface
  chat: {
    you: 'You',
    kiwi: 'Kiwi',
    actions: {
      optionFindRecipe: 'Find Recipe',
      optionGenerateWeeklyPlan: 'Create Weekly Plan',
      reset:
        'Alright, let’s start over. What would you like to cook today?',
    },
    status: {
      recipes: {
        checking: 'Downloading recipes...',
        failed:
          'Sorry, I couldn’t retrieve any recipes. Please try again later.',
      },
    },
    input: {
      label: 'What would you like to cook?',
      placeholder: 'For example: Spaghetti Carbonara',
    },
    suggestion: {
      notFound: 'No matching suggestions found.',
    },
  },

  // Recipe search related
  search: {
    options: {
      type: 'How would you like to search?',
      byQuery: 'Find recipes by keyword',
      byQuestions: 'Find recipes by questions',
    },
    query: {
      action: 'Filter recipes by keyword. For example: <strong>Spaghetti</strong><br><br>Click on the search result to see more details.',
      placeholder: 'For example: Spaghetti Carbonara',
      noResults: 'No matching recipes found. Try another search term.',
    },
    questions: {
      servings: 'How many people would you like to cook for?',
      recipeType: 'What type of dish are you looking for?',
      dietaryRestrictions: 'Are there any dietary preferences?',
      cookingTime: 'How much time would you like to spend cooking?',
      cuisine: 'Which cuisine do you prefer today?',
      lastQuestion: 'Lastly: ',
    },
    results: {
      searching:
        'Great! I’m now searching for recipes based on your preferences: {preferences}',
      noResults:
        'Unfortunately, I couldn’t find any matching recipes. Should we adjust the search?',
      found: 'I found matching recipes.',
      error:
        'Oops! Something went wrong. Would you like to try again?',
    },
    actions: {
      broaden: 'Adjust search',
      startOver: 'Start new',
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
      budget: 'Affordable and tasty',
    },
    dietary: {
      none: 'No restrictions',
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      glutenFree: 'Gluten-free',
      dairyFree: 'Lactose-free',
      lowCarb: 'Low-carb',
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
    cookingTime: 'At most {time} minutes cooking time',
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
      shoppingList: 'Would you like me to create a shopping list?',
      scanFridge: 'Would you like to scan your fridge?',
    },
    status: {
      generating: 'I am creating your weekly plan. Please wait...',
      planFor: 'Your weekly plan for {days} days:',
      noIngredients:
        'Unfortunately, I couldn’t find any matching recipes. Should we adjust the requirements?',
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
      placeholder: 'For example: Tomatoes, onions, garlic',
    },
  },

  // Recipe details
  recipe: {
    servings: 'Servings',
    minutes: 'Minutes',
    ingredients: 'Ingredients',
    directions: 'Steps',
    direction: 'Step | Steps',
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
    signUp: 'Sign up now!',
  },

  // Error handling
  error: {
    notFound:
      'Oops! 🥝 We can’t find this recipe. Please select another one!',
    backToHome: 'Back to home page',
  },

  // LLM
  llm: {
    downloading: 'Loading model',
    summarize: 'Summarize',
    disclaimer: 'The summary was generated by an AI model. It is for informational purposes only and may contain errors or inaccuracies. No responsibility is taken for its correctness.',
  },

  // Common units
  units: {
    minutes: 'Minute | Minutes',
    date: {
      days: 'Day | Days',
      the: 'the',
      weekdays: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
      },
      months: {
        january: 'January',
        february: 'February',
        march: 'March',
        april: 'April',
        may: 'May',
        june: 'June',
        july: 'July',
        august: 'August',
        september: 'September',
        october: 'October',
        november: 'November',
        december: 'December',
      },
    },
  },

  // Footer
  footer: {
    madeWithLove: 'Made with love',
    allRightsReserved: 'All rights reserved',
    github: 'Follow us on GitHub',
  },
};
