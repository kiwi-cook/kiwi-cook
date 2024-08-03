import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:taste_buddy_client/models/api.dart';
import 'package:taste_buddy_client/models/recipe.dart';

class RecipeService {
  Future<List<Recipe>> fetchRecipes() async {
    final response = await http.get(Uri.parse('http://localhost:8000/recipe/'));

    if (response.statusCode == 200) {
      final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
      final apiResponseList = APIResponseList<Recipe>.fromJson(
        jsonResponse,
        (json) => Recipe.fromJson(json),
      );

      return apiResponseList.response;
    } else {
      throw Exception('Recipes Service: Failed to load recipes');
    }
  }
}
