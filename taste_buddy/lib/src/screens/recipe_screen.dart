import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/recipe_model.dart';
import '../providers/recipe_provider.dart';
import '../widgets/recipe/recipe_steps_widget.dart';

class RecipeScreen extends StatefulWidget {
  final String? recipeId;

  RecipeScreen({required this.recipeId, Key? key}) : super(key: key);

  @override
  _RecipeScreenState createState() => _RecipeScreenState();
}

class _RecipeScreenState extends State<RecipeScreen> {
  late Recipe recipe;
  late int servings;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.recipeId == null) {
        return;
      }
      final recipeProvider =
          Provider.of<RecipeProvider>(context, listen: false);
      recipeProvider.fetchRecipes();
      final fetchedRecipe = recipeProvider.findById(widget.recipeId!);
      if (fetchedRecipe != null) {
        setState(() {
          recipe = fetchedRecipe;
          servings = recipe.servings;
        });
      }
    });
  }

  void setServings(int newServings) {
    setState(() {
      servings = newServings;
      recipe.setServings(newServings);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (widget.recipeId == null || recipe == null) {
      return Scaffold(
        appBar: AppBar(
          leading: const BackButton(),
          title: const Text("Recipe not found"),
        ),
        body: const Center(child: Text("Recipe could not be loaded.")),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(recipe.name.getFirst()),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {},
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTitleSection(context),
              const SizedBox(height: 16),
              _buildImageSection(),
              const SizedBox(height: 16),
              _buildIngredientsSection(context),
              const SizedBox(height: 16),
              _buildPreparationSection(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTitleSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          recipe.name.getFirst(),
          style: Theme.of(context).textTheme.headlineLarge,
        ),
        const SizedBox(height: 8),
        Text(
          'by nobody', // Replace with the actual author
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 8),
        if (recipe.tags != null)
          Wrap(
            spacing: 8.0,
            children: recipe.tags!.map((tag) {
              return Chip(
                label: Text(tag),
                labelStyle: const TextStyle(color: Colors.white),
              );
            }).toList(),
          ),
      ],
    );
  }

  Widget _buildImageSection() {
    return Row(
      children: [
        Expanded(
          child: Image.network(
            recipe.imageUrl ?? 'assets/placeholder.jpg',
            fit: BoxFit.cover,
            height: 200,
          ),
        ),
        const SizedBox(width: 16),
        Column(
          children: [
            Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
            const SizedBox(width: 4),
            Text(
              '${recipe.duration} min',
              style: Theme.of(context).textTheme.labelMedium,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildIngredientsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${recipe.ingredients?.length ?? 0} Ingredients',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Text(
                '$servings Servings',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
            Slider(
              value: servings.toDouble(),
              min: 1,
              max: 20,
              divisions: 19,
              label: '$servings Servings',
              onChanged: (value) => setServings(value.toInt()),
            ),
          ],
        ),
        const SizedBox(height: 8),
        // Uncomment and implement IngredientsList widget
        // IngredientsList(ingredients: recipe.ingredients),
      ],
    );
  }

  Widget _buildPreparationSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Preparation',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 8),
        RecipeSteps(steps: recipe.steps),
      ],
    );
  }
}
