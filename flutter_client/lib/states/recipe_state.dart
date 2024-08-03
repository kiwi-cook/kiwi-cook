import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:taste_buddy_client/models/recipe.dart';
import 'package:taste_buddy_client/services/recipe_service.dart';

// Service provider
final recipeServiceProvider = Provider((ref) => RecipeService());

// Future provider for fetching recipe list
final recipeListProvider = FutureProvider<List<Recipe>>((ref) async {
  final recipeService = ref.read(recipeServiceProvider);
  return recipeService.fetchRecipes();
});
