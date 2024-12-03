export default {
  app: {
    tagline: 'Dein persönlicher Kochassistent',
    login: 'Anmelden',
    logout: 'Abmelden',
  },

  // Core app sections
  introduction: {
    title: 'Willkommen in der Kiwi-Küche!',
    subtitle: 'Dein persönlicher Kochassistent',
    welcome:
      'Hey! Ich bin Kiwi <span class="text-kiwi-logo"></span> und ich helfe dir gerne beim Kochen. Was möchtest du machen?',
    start: 'Loslegen',
  },

  // Chat interface
  chat: {
    you: 'Du',
    kiwi: 'Kiwi',
    actions: {
      optionFindRecipe: 'Rezept finden',
      optionGenerateWeeklyPlan: 'Wochenplan erstellen',
      reset: 'Alles klar, lass uns von vorne anfangen. Was möchtest du heute kochen?',
    },
    status: {
      recipes: {
        checking: 'Lade Rezepte herunter...',
        failed: 'Entschuldige, ich konnte keine Rezepte abrufen. Bitte versuche es später erneut.',
      },
    },
    input: {
      label: 'Was möchtest du kochen?',
      placeholder: 'Zum Beispiel: Spaghetti Carbonara',
    },
    suggestion: {
      notFound: 'Keine passenden Vorschläge gefunden.',
    },
  },

  // Recipe search related
  search: {
    options: {
      type: 'Wie möchtest du suchen?',
      byQuery: 'Finde Rezepte mit Suchbegriff',
      byQuestions: 'Finde Rezepte mit Fragen',
    },
    query: {
      action:
        'Filtere Rezepte nach Suchbegriff. Zum Beispiel: <strong>Spaghetti</strong><br><br>' +
        'Klicke das Suchergebnis an, um dir mehr Details anzusehen.',
      placeholder: 'Zum Beispiel: Spaghetti Carbonara',
      noResults: 'Keine passenden Rezepte gefunden. Probiere es mit einem anderen Suchbegriff.',
    },
    questions: {
      servings: 'Für wie viele Personen möchtest du kochen?',
      recipeType: 'Welche Art von Gericht suchst du?',
      dietaryRestrictions: 'Gibt es besondere Ernährungswünsche?',
      cookingTime: 'Wie viel Zeit möchtest du zum Kochen einplanen?',
      cuisine: 'Welche Küche bevorzugst du heute?',
      lastQuestion: 'Zum Schluss: ',
    },
    results: {
      searching: 'Prima! Ich suche jetzt nach Rezepten mit deinen Vorlieben: {preferences}',
      noResults: 'Leider habe ich keine passenden Rezepte gefunden. Sollen wir die Suche anpassen?',
      found: 'Ich habe passende Rezepte gefunden.',
      error: 'Ups! Da ist etwas schiefgegangen. Möchtest du es nochmal versuchen?',
    },
    actions: {
      broaden: 'Suche anpassen',
      startOver: 'Neu beginnen',
      moreOptions: 'Weitere Rezepte',
      startCooking: 'Kochen starten',
      newSearch: 'Neue Suche',
    },
  },

  // Recipe categories and filters
  filters: {
    recipeType: {
      dontCare: 'Egal',
      quick: 'Schnell und einfach',
      healthy: 'Gesund und ausgewogen',
      comfort: 'Wohlfühlgerichte',
      gourmet: 'Besondere Gerichte',
      budget: 'Günstig und lecker',
    },
    dietary: {
      none: 'Keine Einschränkungen',
      vegetarian: 'Vegetarisch',
      vegan: 'Vegan',
      glutenFree: 'Glutenfrei',
      dairyFree: 'Laktosefrei',
      lowCarb: 'Kohlenhydratarm',
    },
    cuisine: {
      italian: 'Italienisch',
      mexican: 'Mexikanisch',
      asian: 'Asiatisch',
      mediterranean: 'Mediterran',
      american: 'Amerikanisch',
      surprise: 'Überrasche mich!',
    },
    servings: {
      1: 'Eine Person',
      2: 'Zwei Personen',
      3: 'Drei Personen',
      4: 'Vier Personen',
      '5plus': 'Fünf oder mehr Personen',
    },
    cookingTime: 'höchstens {time} Minuten Kochzeit',
  },

  // Meal planning
  plan: {
    meals: {
      breakfast: 'Frühstück',
      lunch: 'Mittagessen',
      dinner: 'Abendessen',
    },
    questions: {
      days: 'Für wie viele Tage möchtest du einen Plan erstellen?',
      ingredients: 'Welche Zutaten hast du bereits zu Hause?',
      shoppingList: 'Soll ich eine Einkaufsliste erstellen?',
      scanFridge: 'Möchtest du deinen Kühlschrank scannen?',
    },
    status: {
      generating: 'Ich erstelle deinen Wochenplan. Einen Moment bitte...',
      planFor: 'Dein Wochenplan für {days} Tage:',
      noIngredients:
        'Leider finde ich keine passenden Rezepte. Sollen wir die Anforderungen anpassen?',
    },
    weekdays: {
      0: 'Montag',
      1: 'Dienstag',
      2: 'Mittwoch',
      3: 'Donnerstag',
      4: 'Freitag',
      5: 'Samstag',
      6: 'Sonntag',
    },
    ingredients: {
      nothing: 'Nichts',
      submit: 'Fertig',
      placeholder: 'Zum Beispiel: Tomaten, Zwiebeln, Knoblauch',
    },
  },

  // Recipe details
  recipe: {
    adjustServings: 'Portionen anpassen',
    servings: 'Portion | Portionen',
    ingredients: 'Zutat | Zutaten',
    directions: 'Schritt | Schritte',
    share: 'Teilen',
  },

  // Shopping list
  shopping: {
    addToList: 'Zur Einkaufsliste hinzufügen',
  },

  login: {
    title: 'Melde dich mit deinem Kiwi-Konto an',
    username: 'Benutzername',
    password: 'Passwort',
    keepSignedIn: 'Angemeldet bleiben',
    forgotPassword: 'Passwort vergessen?',
    signUp: 'Jetzt registrieren!',
  },

  // Registration
  register: {
    title: 'Erstelle ein neues Kiwi-Konto',
    username: 'Benutzername',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    alreadyHaveAccount: 'Bereits registriert?',
    passwordNotMatch: 'Passwörter stimmen nicht überein',
    signUp: 'Registrieren',
  },

  // Error handling
  error: {
    notFound:
      'Hoppla! 🥝 Dieses Rezept können wir leider nicht finden. Bitte wähle ein anderes aus!',
    backToHome: 'Zurück zur Startseite',
  },

  // LLM
  llm: {
    downloading: 'Lade Modell',
    summarize: 'Zusammenfassen',
    translate: 'Übersetzen',
    processing: 'Verarbeite Text',
    disclaimer:
      'Die Zusammenfassung wurde von einem KI-Modell erstellt.' +
      'Sie dient nur zu Informationszwecken und kann Fehler oder Ungenauigkeiten enthalten.' +
      'Eine Verantwortung für die Richtigkeit wird nicht übernommen.',
  },

  // Common units
  units: {
    minutes: 'Minute | Minuten',
    date: {
      days: 'Tag | Tage',
      the: 'der',
      weekdays: {
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag',
      },
      months: {
        january: 'Januar',
        february: 'Februar',
        march: 'März',
        april: 'April',
        may: 'Mai',
        june: 'Juni',
        july: 'Juli',
        august: 'August',
        september: 'September',
        october: 'Oktober',
        november: 'November',
        december: 'Dezember',
      },
    },
  },

  // Footer
  footer: {
    madeWithLove: 'Mit Liebe gemacht',
    allRightsReserved: 'Alle Rechte vorbehalten',
    github: 'Folge uns auf GitHub',
  },
}
