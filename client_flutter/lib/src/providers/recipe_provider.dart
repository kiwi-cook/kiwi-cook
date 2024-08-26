import 'dart:convert';

import 'package:flutter/material.dart';
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

    final response = await http.get(Uri.parse('http://127.0.0.1:8000/recipe/'));
    if (response.statusCode == 200) {
      // Parse the JSON response into a List
      List<dynamic> jsonList = jsonDecode(response.body)['response'];

      // Convert the List of Maps to a List of Recipe objects
      _recipes =
          jsonList.map<Recipe>((recipe) => Recipe.fromJson(recipe)).toList();
    } else {
      throw Exception('Failed to load recipes');
    }

    _isLoading = false;
    notifyListeners();
    return _recipes;
  }
}
