class MultiLanguageField {
  Map<String, String> translations;

  MultiLanguageField({required this.translations});

  String operator [](String lang) => translations[lang] ?? "";

  void operator []=(String lang, String value) {
    translations[lang] = value;
  }

  get keys => translations.keys;

  getFirst() {
    return translations.values.first;
  }
}

class Ingredient {
  final String id;
  final MultiLanguageField name;

  Ingredient({required this.id, required this.name});

  factory Ingredient.fromJson(Map<String, dynamic> json) {
    return Ingredient(
      id: json['id'],
      name: MultiLanguageField(
          translations: Map<String, String>.from(json['name']['translations'])),
    );
  }
}

class RecipeIngredient {
  final Ingredient ingredient;
  final String? comment;
  double? quantity;
  final String? unit;

  RecipeIngredient({
    required this.ingredient,
    this.comment,
    this.quantity,
    this.unit,
  });

  factory RecipeIngredient.fromJson(Map<String, dynamic> json) {
    return RecipeIngredient(
      ingredient: Ingredient.fromJson(json['ingredient']),
      comment: json['comment'],
      quantity: json['quantity']?.toDouble(),
      unit: json['unit'],
    );
  }
}

class RecipeStep {
  final MultiLanguageField description;
  final List<RecipeIngredient>? ingredients;
  final String? imgUrl;
  final double? duration;
  final double? temperature;

  RecipeStep({
    required this.description,
    this.ingredients,
    this.imgUrl,
    this.duration,
    this.temperature,
  });

  factory RecipeStep.fromJson(Map<String, dynamic> json) {
    return RecipeStep(
      description: MultiLanguageField(
          translations:
              Map<String, String>.from(json['description']['translations'])),
      ingredients: json['ingredients'] != null
          ? (json['ingredients'] as List)
              .map((i) => RecipeIngredient.fromJson(i))
              .toList()
          : null,
      imgUrl: json['imgUrl'],
      duration: json['duration']?.toDouble(),
      temperature: json['temperature']?.toDouble(),
    );
  }
}

class RecipeAuthor {
  final String name;
  final String? url;

  RecipeAuthor({required this.name, this.url});

  factory RecipeAuthor.fromJson(Map<String, dynamic> json) {
    return RecipeAuthor(
      name: json['name'],
      url: json['url']
    );
  }
}

class RecipeSource {
  final String? url;
  final List<RecipeAuthor>? authors;
  final List<String>? cookbooks;

  RecipeSource({this.url, this.authors, this.cookbooks});

  factory RecipeSource.fromJson(Map<String, dynamic> json) {
    return RecipeSource(
      url: json['url'],
      authors: json['authors'] != null
          ? (json['authors'] as List)
              .map((a) => RecipeAuthor.fromJson(a))
              .toList()
          : null,
      cookbooks: json['cookbooks'] != null
          ? List<String>.from(json['cookbooks'])
          : null,
    );
  }
}

class Nutrition {
  final int calories;
  final double protein;
  final double carbs;
  final double fat;
  final double fiber;

  Nutrition({
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.fiber,
  });

  factory Nutrition.fromJson(Map<String, dynamic> json) {
    return Nutrition(
      calories: json['calories']?.toDouble(),
      protein: json['protein']?.toDouble(),
      carbs: json['carbs']?.toDouble(),
      fat: json['fat']?.toDouble(),
      fiber: json['fiber']?.toDouble(),
    );
  }
}

class Recipe {
  final String id;
  final MultiLanguageField name;
  final MultiLanguageField description;
  final String lang;
  final List<RecipeIngredient>? ingredients;
  final List<RecipeStep> steps;
  final Map<String, dynamic> props;
  final RecipeSource? src;
  final bool deleted;
  final int servings;
  final int duration;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? cuisine;
  final String difficulty;
  final double? rating;
  final Nutrition? nutrition;
  final String? imageUrl;
  final String? videoUrl;

  Recipe({
    required this.id,
    required this.name,
    required this.description,
    this.lang = 'en-US',
    this.ingredients,
    required this.steps,
    required this.props,
    this.src,
    this.deleted = false,
    this.servings = 1,
    this.duration = 0,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.cuisine,
    this.difficulty = 'medium',
    this.rating,
    this.nutrition,
    this.imageUrl,
    this.videoUrl,
  })  : createdAt = createdAt ?? DateTime.now().toUtc(),
        updatedAt = updatedAt ?? DateTime.now().toUtc(),
        assert(rating == null || (rating >= 0 && rating <= 5));

  factory Recipe.fromJson(Map<String, dynamic> json) {
    return Recipe(
      id: json['id'],
      name: MultiLanguageField(
          translations: Map<String, String>.from(json['name']['translations'])),
      description: MultiLanguageField(
          translations:
              Map<String, String>.from(json['description']['translations'])),
      lang: json['lang'] ?? 'en-US',
      ingredients: json['items'] != null
          ? (json['items'] as List)
              .map((i) => RecipeIngredient.fromJson(i))
              .toList()
          : null,
      steps:
          (json['steps'] as List).map((s) => RecipeStep.fromJson(s)).toList(),
      props: Map<String, dynamic>.from(json['props']),
      src: json['src'] != null ? RecipeSource.fromJson(json['src']) : null,
      deleted: json['deleted'] ?? false,
      servings: json['servings'] ?? 1,
      duration: json['duration'] ?? 0,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      cuisine: json['cuisine'],
      difficulty: json['difficulty'] ?? 'medium',
      rating: json['rating']?.toDouble(),
      nutrition: json['nutrition'] != null
          ? Nutrition.fromJson(json['nutrition'])
          : null,
      imageUrl: json['image_url'],
      videoUrl: json['video_url'],
    );
  }

  void setServings(int servings) {
    ingredients?.forEach((ingredient) {
      ingredient.quantity = ingredient.quantity! * servings;
    });
  }
}
