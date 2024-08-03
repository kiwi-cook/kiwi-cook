import 'package:flutter/foundation.dart';

class MultiLanguageField {
  final Map<String, String> translations;

  MultiLanguageField({required this.translations});

  String operator [](String lang) => translations[lang] ?? '';

  void operator []=(String lang, String value) {
    translations[lang] = value;
  }

  factory MultiLanguageField.newField(String lang, String value) {
    if (kDebugMode) {
      print('Creating new MultiLanguageField with value: $value');
    }
    return MultiLanguageField(translations: {lang: value});
  }

  List<String> get langs => translations.keys.toList();

  factory MultiLanguageField.fromJson(dynamic json) {
    if (json is Map<String, dynamic> && json.containsKey('translations')) {
      var translationsJson = json['translations'] as Map<String, dynamic>;
      var translations =
          translationsJson.map((key, value) => MapEntry(key, value as String));
      return MultiLanguageField(translations: translations);
    } else if (json is Map<String, String>) {
      return MultiLanguageField(translations: json);
    } else {
      throw ArgumentError('Invalid JSON format for MultiLanguageField');
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'translations': translations,
    };
  }
}

class Ingredient {
  final String? id;
  final MultiLanguageField name;

  Ingredient({this.id, required this.name});

  factory Ingredient.newIngredient(String name,
      {String? id, String lang = 'en'}) {
    if (kDebugMode) {
      print('Creating new Ingredient with name: $name');
    }
    return Ingredient(id: id, name: MultiLanguageField.newField(lang, name));
  }

  factory Ingredient.fromJson(Map<String, dynamic> json) {
    return Ingredient(
      id: json['_id'],
      name: MultiLanguageField.fromJson(json['name']),
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'name': name.toJson(),
      };
}

class RecipeIngredient {
  final Ingredient item;
  final double? quantity;
  final String? unit;

  RecipeIngredient({required this.item, this.quantity, this.unit});

  factory RecipeIngredient.newRecipeIngredient(Ingredient item,
      {double? quantity, String? unit}) {
    if (kDebugMode) {
      print('Creating new RecipeIngredient with item: $item');
    }
    return RecipeIngredient(item: item, quantity: quantity, unit: unit);
  }

  factory RecipeIngredient.fromJson(Map<String, dynamic> json) {
    return RecipeIngredient(
      item: Ingredient.fromJson(json['item']),
      quantity: json['quantity'],
      unit: json['unit'],
    );
  }

  Map<String, dynamic> toJson() => {
        'item': item.toJson(),
        'quantity': quantity,
        'unit': unit,
      };
}

class RecipeStep {
  final MultiLanguageField description;
  final List<RecipeIngredient>? ingredients;
  final Uri? imgUrl;
  final int? duration;
  final int? temperature;

  RecipeStep(
      {required this.description,
      this.ingredients,
      this.imgUrl,
      this.duration,
      this.temperature});

  factory RecipeStep.newRecipeStep(MultiLanguageField description,
      {List<RecipeIngredient>? ingredients,
      Uri? imgUrl,
      int? duration,
      int? temperature}) {
    if (kDebugMode) {
      print('Creating new RecipeStep with description: $description');
    }
    return RecipeStep(
        description: description,
        ingredients: ingredients,
        imgUrl: imgUrl,
        duration: duration,
        temperature: temperature);
  }

  factory RecipeStep.fromJson(Map<String, dynamic> json) {
    return RecipeStep(
      description: MultiLanguageField.fromJson(json['description']),
      ingredients: json['ingredients'] != null
          ? List<RecipeIngredient>.from(
              json['ingredients'].map((x) => RecipeIngredient.fromJson(x)))
          : null,
      imgUrl: json['imgUrl'] != null ? Uri.parse(json['imgUrl']) : null,
      duration: json['duration'],
      temperature: json['temperature'],
    );
  }

  Map<String, dynamic> toJson() => {
        'description': description.toJson(),
        'ingredients': ingredients?.map((x) => x.toJson()).toList(),
        'imgUrl': imgUrl?.toString(),
        'duration': duration,
        'temperature': temperature,
      };
}

class RecipeAuthor {
  final String name;
  final Uri? url;

  RecipeAuthor({required this.name, this.url});

  factory RecipeAuthor.fromJson(Map<String, dynamic> json) {
    return RecipeAuthor(
      name: json['name'],
      url: json['url'] != null ? Uri.parse(json['url']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'url': url?.toString(),
      };
}

class RecipeSource {
  final Uri url;
  final List<RecipeAuthor> authors;
  final List<String> cookbooks;

  RecipeSource(
      {required this.url, required this.authors, this.cookbooks = const []});

  factory RecipeSource.fromJson(Map<String, dynamic> json) {
    return RecipeSource(
      url: Uri.parse(json['url'] ?? ''),
      authors: List<RecipeAuthor>.from(
          (json['authors'] ?? []).map((x) => RecipeAuthor.fromJson(x))),
      cookbooks: List<String>.from(json['cookbooks'] ?? []),
    );
  }

  Map<String, dynamic> toJson() => {
        'url': url.toString(),
        'authors': authors.map((x) => x.toJson()).toList(),
        'cookbooks': cookbooks,
      };
}

class Nutrition {
  final int calories;
  final double protein;
  final double carbs;
  final double fat;
  final double fiber;

  Nutrition(
      {required this.calories,
      required this.protein,
      required this.carbs,
      required this.fat,
      required this.fiber});

  factory Nutrition.fromJson(Map<String, dynamic> json) {
    return Nutrition(
      calories: json['calories'],
      protein: json['protein'],
      carbs: json['carbs'],
      fat: json['fat'],
      fiber: json['fiber'],
    );
  }

  Map<String, dynamic> toJson() => {
        'calories': calories,
        'protein': protein,
        'carbs': carbs,
        'fat': fat,
        'fiber': fiber,
      };
}

class Recipe {
  final String? id;
  final MultiLanguageField name;
  final MultiLanguageField description;
  final List<RecipeIngredient>? ingredients;
  final List<RecipeStep> steps;
  final Map<String, dynamic> props;
  final RecipeSource? src;
  final bool deleted;
  final int duration;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? cuisine;
  final String difficulty;
  final double? rating;
  final Nutrition? nutrition;
  final Uri? imageUrl;
  final Uri? videoUrl;

  Recipe(
      {this.id,
      required this.name,
      required this.description,
      this.ingredients,
      required this.steps,
      required this.props,
      this.src,
      required this.deleted,
      required this.duration,
      required this.createdAt,
      required this.updatedAt,
      this.cuisine,
      required this.difficulty,
      this.rating,
      this.nutrition,
      this.imageUrl,
      this.videoUrl});

  String getName() => name[name.langs.first];

  factory Recipe.fromJson(Map<String, dynamic> json) {
    return Recipe(
      id: json['_id'],
      name: MultiLanguageField.fromJson(json['name']),
      description: MultiLanguageField.fromJson(json['description']),
      ingredients: json['items'] != null
          ? List<RecipeIngredient>.from(
              json['items'].map((x) => RecipeIngredient.fromJson(x)))
          : null,
      steps: List<RecipeStep>.from(
          json['steps'].map((x) => RecipeStep.fromJson(x))),
      props: Map<String, dynamic>.from(json['props']),
      src: json['src'] != null ? RecipeSource.fromJson(json['src']) : null,
      deleted: json['deleted'],
      duration: json['duration'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      cuisine: json['cuisine'],
      difficulty: json['difficulty'],
      rating: json['rating'],
      nutrition: json['nutrition'] != null
          ? Nutrition.fromJson(json['nutrition'])
          : null,
      imageUrl: json['image_url'] != null ? Uri.parse(json['image_url']) : null,
      videoUrl: json['video_url'] != null ? Uri.parse(json['video_url']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'name': name.toJson(),
        'description': description.toJson(),
        'items': ingredients?.map((x) => x.toJson()).toList(),
        'steps': steps.map((x) => x.toJson()).toList(),
        'props': props,
        'src': src?.toJson(),
        'deleted': deleted,
        'duration': duration,
        'created_at': createdAt.toIso8601String(),
        'updated_at': updatedAt.toIso8601String(),
        'cuisine': cuisine,
        'difficulty': difficulty,
        'rating': rating,
        'nutrition': nutrition?.toJson(),
        'image_url': imageUrl?.toString(),
        'video_url': videoUrl?.toString(),
      };
}
