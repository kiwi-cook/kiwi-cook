class MultiLanguageField {
  Map<String, String> translations;

  MultiLanguageField({required this.translations});

  String operator [](String lang) => translations[lang] ?? "";

  void operator []=(String lang, String value) {
    translations[lang] = value;
  }

  get keys => translations.keys;

  getFirst () {
    return translations.values.first;
  }
}

class Ingredient {
  String? id;
  MultiLanguageField name;

  Ingredient({this.id, required this.name});

  factory Ingredient.fromJson(Map<String, dynamic> json) {
    return Ingredient(
      id: json['_id'],
      name: MultiLanguageField(translations: Map<String, String>.from(json['name']['translations'])),
    );
  }
}

class RecipeIngredient {
  Ingredient ingredient;
  String? comment;
  double? quantity;
  String? unit;

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
  MultiLanguageField description;
  List<RecipeIngredient>? ingredients;
  String? imgUrl;
  double? duration;
  double? temperature;

  RecipeStep({
    required this.description,
    this.ingredients,
    this.imgUrl,
    this.duration,
    this.temperature,
  });

  factory RecipeStep.fromJson(Map<String, dynamic> json) {
    var ingredientList = json['ingredients'] as List<dynamic>?;
    return RecipeStep(
      description: MultiLanguageField(translations: Map<String, String>.from(json['description']['translations'])),
      ingredients: ingredientList?.map((e) => RecipeIngredient.fromJson(e)).toList(),
      imgUrl: json['imgUrl'],
      duration: json['duration']?.toDouble(),
      temperature: json['temperature']?.toDouble(),
    );
  }
}

class Recipe {
  String? id;
  MultiLanguageField name;
  MultiLanguageField description;
  List<RecipeIngredient>? ingredients;
  List<RecipeStep> steps;
  bool deleted;
  int servings;
  int duration;
  DateTime createdAt;
  DateTime updatedAt;
  String? cuisine;
  String difficulty;
  double? rating;
  Map<String, dynamic> nutrition;
  String? imageUrl;
  String? videoUrl;
  List<String>? tags;

  Recipe({
    this.id,
    required this.name,
    required this.description,
    this.ingredients,
    required this.steps,
    required this.deleted,
    required this.servings,
    required this.duration,
    required this.createdAt,
    required this.updatedAt,
    this.cuisine,
    required this.difficulty,
    this.rating,
    required this.nutrition,
    this.imageUrl,
    this.videoUrl,
    this.tags,
  });

  factory Recipe.fromJson(Map<String, dynamic> json) {
    var ingredientList = json['items'] as List<dynamic>?;
    var stepList = json['steps'] as List<dynamic>;
    
    return Recipe(
      id: json['id'],
      name: MultiLanguageField(translations: Map<String, String>.from(json['name']['translations'])),
      description: MultiLanguageField(translations: Map<String, String>.from(json['description']['translations'])),
      ingredients: ingredientList?.map((e) => RecipeIngredient.fromJson(e)).toList(),
      steps: stepList.map((e) => RecipeStep.fromJson(e)).toList(),
      deleted: json['deleted'] ?? false,
      servings: json['servings'] ?? 1,
      duration: json['duration'] ?? 0,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      cuisine: json['cuisine'],
      difficulty: json['difficulty'] ?? 'medium',
      rating: json['rating']?.toDouble(),
      nutrition: Map<String, dynamic>.from(json['nutrition'] ?? {}),
      imageUrl: json['image_url'],
      videoUrl: json['video_url'],
      tags: json['tags']?.cast<List<String>>(),
    );
  }

  void setServings(int servings) {
    ingredients?.forEach((ingredient) {
      ingredient.quantity = ingredient.quantity! * servings;
    });
  }
}
