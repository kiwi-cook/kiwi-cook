import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/recipe_model.dart';
import '../providers/recipe_provider.dart';
import '../providers/user_provider.dart';
import '../widgets/layout/bottom_nav_bar_widget.dart';
import '../widgets/recipe/recipe_widget.dart';

class RecipeScreen extends StatefulWidget {
  final String? recipeId;

  const RecipeScreen({required this.recipeId, super.key});

  @override
  _RecipeScreenState createState() => _RecipeScreenState();
}

class _RecipeScreenState extends State<RecipeScreen> {
  Recipe? recipe;
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
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);

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
        title: Text(recipe!.name.getFirst()),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: Icon(
              userProvider.isFavoriteRecipe(recipe!.id)
                  ? Icons.favorite
                  : Icons.favorite_border,
            ),
            onPressed: () => userProvider.toggleRecipeFavorite(recipe!.id),
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
          child: RecipeWidget(recipe: recipe!),
        ),
      ),
      //bottomNavigationBar: const BottomNavBar(),
    );
  }
}
