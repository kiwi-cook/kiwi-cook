import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taste_buddy/src/router/taste_buddy_router.dart';
import '../models/recipe_model.dart';
import '../providers/recipe_provider.dart';
import '../widgets/searchbar_widget.dart';
import 'package:fuzzywuzzy/fuzzywuzzy.dart';

class SearchScreen extends StatefulWidget {
  final ScrollController? scrollController;

  const SearchScreen({super.key, this.scrollController});

  @override
  _SearchScreenState createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  // List of recipes to display
  final List<Recipe> filteredRecipes = [];
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final recipeProvider = Provider.of<RecipeProvider>(context);

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

    void search(String query) {
      filteredRecipes.clear();
      if (query.isEmpty) {
        setState(() {});
        return;
      }
      query = query.toLowerCase();

      // Update the query state
      _query = query;

      const int fuzzyRatioThreshold = 70;
      List<String> queryWords = query.split(' ');

      for (var recipe in recipeProvider.recipes) {
        if (isSimpleMatch(recipe.name.getFirst(), queryWords) ||
            isSimpleMatch(recipe.description.getFirst(), queryWords) ||
            (recipe.ingredients != null &&
                recipe.ingredients!.any((ingredient) => isSimpleMatch(
                    ingredient.ingredient.name.getFirst(), queryWords))) ||
            isFuzzyMatch(
                recipe.name.getFirst(), queryWords, fuzzyRatioThreshold) ||
            isFuzzyMatch(recipe.description.getFirst(), queryWords,
                fuzzyRatioThreshold) ||
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

      setState(() {});
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Recipes'),
        // Remove the back button when shown in a modal
        automaticallyImplyLeading: widget.scrollController == null,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => popOrHome(context),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Searchbar(
              onSearch: (query) => search(query),
              autofocus: true,
            ),
          ),
          filteredRecipes.isEmpty && _query.isNotEmpty
              ? const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('No Recipes found'),
                )
              : Expanded(
                  child: ListView.builder(
                    controller: widget.scrollController,
                    itemCount: filteredRecipes.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        title: Text(filteredRecipes[index].name.getFirst()),
                        onTap: () => context
                            .push('/recipe/${filteredRecipes[index].id}'),
                      );
                    },
                  ),
                ),
        ],
      ),
    );
  }
}
