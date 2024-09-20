import 'package:fuzzywuzzy/fuzzywuzzy.dart';
import 'package:taste_buddy/src/models/recipe_model.dart';

double max(double a, double b) => (a > b) ? a : b;

bool isSimpleMatch(String text, List<String> queryWords) {
  String lowerText = text.toLowerCase();
  return queryWords.every((word) => lowerText.contains(word));
}

bool isFuzzyMatch(String text, List<String> queryWords, int threshold) {
  List<String> textWords = text.toLowerCase().split(' ');
  return queryWords.every((queryWord) =>
      textWords.any((textWord) => ratio(queryWord, textWord) >= threshold));
}

double getMatchScore(String text, List<String> queryWords) {
  List<String> textWords = text.toLowerCase().split(' ');
  double totalScore = 0;
  for (var queryWord in queryWords) {
    double maxScore = textWords
        .map((textWord) => ratio(queryWord, textWord).toDouble())
        .reduce(max);
    totalScore += maxScore;
  }
  return totalScore / queryWords.length;
}

List<Recipe> fuzzySearch(List<Recipe> recipes, String query) {
  List<Recipe> filteredRecipes = [];
  if (query.isEmpty) {
    return List.empty();
  }
  query = query.toLowerCase();

  const int fuzzyRatioThreshold = 70;
  List<String> queryWords = query.split(' ');

  for (var recipe in recipes) {
    if (isSimpleMatch(recipe.name.getFirst(), queryWords) ||
        isSimpleMatch(recipe.description.getFirst(), queryWords) ||
        (recipe.ingredients != null &&
            recipe.ingredients!.any((ingredient) => isSimpleMatch(
                ingredient.ingredient.name.getFirst(), queryWords))) ||
        isFuzzyMatch(recipe.name.getFirst(), queryWords, fuzzyRatioThreshold) ||
        isFuzzyMatch(
            recipe.description.getFirst(), queryWords, fuzzyRatioThreshold) ||
        (recipe.ingredients != null &&
            recipe.ingredients!.any((ingredient) => isFuzzyMatch(
                ingredient.ingredient.name.getFirst(),
                queryWords,
                fuzzyRatioThreshold)))) {
      filteredRecipes.add(recipe);
    }
  }

  filteredRecipes.sort((a, b) {
    double aScore = getMatchScore(a.name.getFirst(), queryWords);
    double bScore = getMatchScore(b.name.getFirst(), queryWords);
    return bScore.compareTo(aScore);
  });

  return filteredRecipes;
}
