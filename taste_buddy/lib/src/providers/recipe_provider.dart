import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:collection/collection.dart';
import 'package:taste_buddy/src/utils/fetch.dart';
import '../models/recipe_model.dart';
import 'health_provider.dart';

class RecipeProvider with ChangeNotifier {
  List<Recipe> _recipes = [];
  bool _isLoading = false;
  final HealthProvider _healthProvider;
  bool _wasHealthy = false;

  RecipeProvider(this._healthProvider) {
    _healthProvider.addListener(_onHealthStatusChanged);
    _wasHealthy = _healthProvider.isHealthy;
    if (_wasHealthy) {
      fetchRecipes();
    }
  }

  List<Recipe> get recipes => _recipes;
  bool get isLoading => _isLoading;

  void _onHealthStatusChanged() {
    if (_healthProvider.isHealthy && !_wasHealthy) {
      fetchRecipes();
    }
    _wasHealthy = _healthProvider.isHealthy;
  }

  Future<bool> fetchRecipes({bool forceRefresh = false}) async {
    if (!_healthProvider.isHealthy) {
      return Future.value(false);
    }

    if (_recipes.isNotEmpty && !forceRefresh) {
      return Future.value(true);
    }

    _isLoading = true;
    notifyListeners();

    try {
      final jsonList =
          await sendRequest('/recipe/', method: 'GET') as List<dynamic>;
      _recipes =
          jsonList.map<Recipe>((recipe) => Recipe.fromJson(recipe)).toList();
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }

    return true;
  }

  Recipe? findById(String id) {
    return _recipes.firstWhereOrNull((recipe) => recipe.id == id);
  }

  Recipe? recipeOfTheDay() {
    if (_recipes.isEmpty) {
      return null;
    }
    DateTime now = DateTime.now();
    int dayOfYear = now.difference(DateTime(now.year, 1, 1)).inDays;
    int randomIndex = Random(dayOfYear).nextInt(_recipes.length);
    return _recipes[randomIndex];
  }

  @override
  void dispose() {
    _healthProvider.removeListener(_onHealthStatusChanged);
    super.dispose();
  }

  List<Recipe> getShortRecipes() {
    return recipes.where((recipe) => recipe.duration <= 20).toList();
  }

  List<Recipe> getRandomRecipes({int max = 4}) {
    return (recipes..shuffle()).take(max).toList();
  }
}

class HttpException implements Exception {
  final String message;
  HttpException(this.message);

  @override
  String toString() => 'HttpException: $message';
}
