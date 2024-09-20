import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:taste_buddy/src/models/recipe_model.dart';
import 'package:taste_buddy/src/providers/recipe_provider.dart';
import 'package:taste_buddy/src/router/taste_buddy_router.dart';
import 'package:taste_buddy/src/utils/search.dart';

class PlanScreen extends StatefulWidget {
  const PlanScreen({super.key});

  @override
  PlanScreenState createState() => PlanScreenState();
}

class PlanScreenState extends State<PlanScreen> {
  final TextEditingController _searchController = TextEditingController();

  // Greedy Recipe Planner
  final List<String> userItems = [];
  final List<Recipe> recipePlan = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      //Provider.of<RecipeProvider>(context, listen: false).suggestRecipes(userItems);
    });
  }

  void addItem(String item) {
    setState(() {
      userItems.add(item);
    });

    final recipes = Provider.of<RecipeProvider>(context, listen: false).recipes;

    // Improved null-safe recipe sorting algorithm with safe comparison
    final recipesSortedByMatchedIngredients = recipes.map((recipe) {
      final ingredients = recipe.ingredients ?? [];
      final matchedIngredients = ingredients
          .where((ingredient) => userItems.any((item) {
                final itemQuery = item.toLowerCase().split(' ');
                return isFuzzyMatch(
                    ingredient.ingredient.name.getFirst(), itemQuery, 70);
              }))
          .toList();
      return {
        'recipe': recipe,
        'matchedIngredients': matchedIngredients,
        'matchRatio': ingredients.isNotEmpty
            ? matchedIngredients.length / ingredients.length
            : 0.0,
      };
    }).toList()
      ..sort((a, b) {
        final double ratioA = a['matchRatio'] as double? ?? 0.0;
        final double ratioB = b['matchRatio'] as double? ?? 0.0;
        return ratioB.compareTo(ratioA);
      });

    List<Recipe> selectOptimalRecipes(List<Map<String, dynamic>> sortedRecipes,
        Set<String> availableIngredients) {
      List<Recipe> selectedRecipes = [];
      Set<String> usedIngredients = {};

      for (var recipeMap in sortedRecipes) {
        Recipe recipe = recipeMap['recipe'];
        List<RecipeIngredient> matchedIngredients =
            recipeMap['matchedIngredients'];

        if (matchedIngredients.any((ingredient) {
          final ingredientName =
              ingredient.ingredient.name.getFirst().toLowerCase();
          return !usedIngredients.any((usedIngredient) {
            final usedIngredientQuery = usedIngredient.toLowerCase().split(' ');
            return isFuzzyMatch(ingredientName, usedIngredientQuery, 70);
          });
        })) {
          selectedRecipes.add(recipe);
          usedIngredients.addAll(matchedIngredients.map((ingredient) =>
              ingredient.ingredient.name.getFirst().toLowerCase()));
        }

        // Optional: Stop if we've used all available ingredients
        if (usedIngredients.length == availableIngredients.length) break;
      }

      return selectedRecipes;
    }

    // Usage
    Set<String> availableIngredients = Set.from(userItems);
    List<Recipe> optimalRecipes = selectOptimalRecipes(
        recipesSortedByMatchedIngredients, availableIngredients);

    setState(() {
      recipePlan.clear();
      recipePlan.addAll(optimalRecipes);
    });
  }

  void removeItem(String item) {
    setState(() {
      userItems.remove(item);
    });
    //Provider.of<RecipeProvider>(context, listen: false).suggestRecipes(userItems);
  }

  Future<void> takePicture() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      // TODO: Implement image upload and analysis
      // For now, we'll simulate the server response
      await Future.delayed(const Duration(seconds: 2));
      List<String> detectedItems = ["Apple", "Banana", "Carrot"];
      setState(() {
        userItems.addAll(detectedItems);
      });
      //Provider.of<RecipeProvider>(context, listen: false).suggestRecipes(userItems);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recipe Planner'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => popOrHome(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              children: [
                const ListTile(
                    title: Text('Your Items:',
                        style: TextStyle(fontWeight: FontWeight.bold))),
                ...userItems.map((item) => Dismissible(
                      key: Key(item),
                      onDismissed: (_) => removeItem(item),
                      background: Container(color: Colors.red),
                      child: ListTile(title: Text(item)),
                    )),
                const ListTile(
                    title: Text('Suggested Recipes:',
                        style: TextStyle(fontWeight: FontWeight.bold))),
                Consumer<RecipeProvider>(
                  builder: (context, recipeProvider, child) {
                    return Column(
                      children: recipePlan
                          .map((recipe) => ListTile(
                                title: Text(recipe.name.getFirst()),
                                subtitle: Text(
                                    'Duration: ${recipe.duration} minutes'),
                              ))
                          .toList(),
                    );
                  },
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      hintText: 'Search for an item',
                    ),
                    onSubmitted: (value) {
                      if (value.isNotEmpty) {
                        addItem(value);
                        _searchController.clear();
                      }
                    },
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.camera_alt),
                  onPressed: takePicture,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
