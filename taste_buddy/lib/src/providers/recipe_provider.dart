import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../models/recipe_model.dart';

class RecipeProvider with ChangeNotifier {
  List<Recipe> _recipes = [];
  bool _isLoading = false;

  List<Recipe> get recipes => _recipes;
  bool get isLoading => _isLoading;

  Future<List<Recipe>> fetchRecipes() async {
    _isLoading = true;
    notifyListeners();

    final response = await http.get(Uri.parse(kDebugMode
        ? 'http://127.0.0.1:8000/recipe/'
        : 'https://taste-buddy.onrender.com/recipe/'));
    if (response.statusCode == 200) {
      // Parse the JSON response into a List
      List<dynamic> jsonList = jsonDecode(response.body)['response'];

      _recipes =
          jsonList.map<Recipe>((recipe) => Recipe.fromJson(recipe)).toList();
    } else {
      throw Exception('Failed to load recipes');
    }

    _isLoading = false;
    notifyListeners();
    return _recipes;
  }

  Recipe findById(String id) {
    return _recipes.firstWhere((recipe) => recipe.id == id);
  }

  Recipe? recipeOfTheDay() {
    // If there are no recipes, return null
    if (_recipes.isEmpty) {
      return null;
    }

    DateTime now = DateTime.now();
    int dayOfYear = now.difference(DateTime(now.year, 1, 1)).inDays;
    int seed = dayOfYear;
    int randomIndex = (seed * 16807) % recipes.length;
    return recipes[randomIndex];
  }
}
