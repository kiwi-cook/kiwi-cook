import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:collection/collection.dart';

import '../models/recipe_model.dart';

class RecipeProvider with ChangeNotifier {
  List<Recipe> _recipes = [];
  bool _isLoading = false;

  List<Recipe> get recipes => _recipes;
  bool get isLoading => _isLoading;

  /// Fetches recipes from the API. Caches the results unless `forceRefresh` is true.
  Future<List<Recipe>> fetchRecipes({bool forceRefresh = false}) async {
    if (_recipes.isNotEmpty && !forceRefresh) {
      return _recipes;
    }

    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse(
        kDebugMode
            ? 'http://127.0.0.1:8000/recipe/'
            : 'https://taste-buddy.onrender.com/recipe/',
      ));

      if (response.statusCode == 200) {
        // Ensure response body is in UTF-8
        final decodedResponse = utf8.decode(response.bodyBytes);
        final Map<String, dynamic> jsonResponse = jsonDecode(decodedResponse);

        if (jsonResponse.containsKey('response')) {
          final jsonList = jsonResponse['response'] as List<dynamic>;

          // Convert the JSON response into a list of Recipe objects
          _recipes = jsonList
              .map<Recipe>((recipe) => Recipe.fromJson(recipe))
              .toList();
        } else {
          throw const FormatException('Unexpected response format');
        }
      } else {
        throw HttpException(
            'Failed to load recipes: ${response.statusCode}');
      }
    } on FormatException catch (e) {
      // Handle JSON decoding error
      throw Exception('Failed to decode recipes: $e');
    } on http.ClientException catch (e) {
      // Handle client-side errors
      throw Exception('Client error occurred: $e');
    } catch (e) {
      // Handle any other type of exception
      throw Exception('An error occurred: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }

    return _recipes;
  }

  /// Finds a recipe by its ID. Returns null if not found.
  Recipe? findById(String id) {
    return _recipes.firstWhereOrNull((recipe) => recipe.id == id);
  }

  /// Returns the recipe of the day based on the day of the year.
  Recipe? recipeOfTheDay() {
    if (_recipes.isEmpty) {
      return null;
    }

    DateTime now = DateTime.now();
    int dayOfYear = now.difference(DateTime(now.year, 1, 1)).inDays;
    int randomIndex = Random(dayOfYear).nextInt(_recipes.length);
    return _recipes[randomIndex];
  }
}

class HttpException implements Exception {
  final String message;
  HttpException(this.message);

  @override
  String toString() => 'HttpException: $message';
}
