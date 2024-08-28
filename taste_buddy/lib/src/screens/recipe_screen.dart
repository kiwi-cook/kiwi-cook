import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/recipe_model.dart';
import '../providers/recipe_provider.dart';
import '../widgets/layout/bottom_nav_bar_widget.dart';
import '../widgets/recipe/recipe_steps_widget.dart';

class RecipeScreen extends StatefulWidget {
  final String? recipeId;

  const RecipeScreen({required this.recipeId, super.key});

  @override
  _RecipeScreenState createState() => _RecipeScreenState();
}

class _RecipeScreenState extends State<RecipeScreen> {
  Recipe? recipe;
  late int servings;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRecipe();
  }

  Future<void> _loadRecipe() async {
    if (widget.recipeId == null) {
      setState(() => isLoading = false);
      return;
    }
    final recipeProvider = Provider.of<RecipeProvider>(context, listen: false);
    await recipeProvider.fetchRecipes();
    final fetchedRecipe = recipeProvider.findById(widget.recipeId!);
    setState(() {
      recipe = fetchedRecipe;
      servings = recipe?.servings ?? 1;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (recipe == null) {
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
        title: Text(recipe?.name.getFirst()),
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
      bottomNavigationBar: const BottomNavBar(),
    );
  }

  Widget _buildTitleSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          recipe?.name.getFirst(),
          style: Theme.of(context).textTheme.headlineLarge,
        ),
        const SizedBox(height: 8),
        Text(
          'by ${recipe?.src?.authors?.map((author) => author.name).join(', ')}',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 8),
        if (recipe != null && recipe?.props['tags'] != null)
          Wrap(
            spacing: 6.0,
            runSpacing: 6.0,
            children: recipe!.props['tags'].map<Widget>((tag) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                decoration: BoxDecoration(
                  color: Colors.orange[50],
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: Colors.orange[200]!),
                ),
                child: Text(
                  tag,
                  style: TextStyle(
                    color: Colors.orange[800],
                    fontSize: 12.0,
                  ),
                ),
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
            recipe?.imageUrl ?? 'assets/placeholder.jpg',
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
              '${recipe?.duration} min',
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
          '${recipe?.ingredients?.length ?? 0} Ingredients',
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
              onChanged: (value) => recipe?.setServings(value.toInt()),
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
        recipe?.steps != null
            ? RecipeSteps(steps: recipe!.steps)
            : const Center(child: Text('No steps found')),
      ],
    );
  }
}
