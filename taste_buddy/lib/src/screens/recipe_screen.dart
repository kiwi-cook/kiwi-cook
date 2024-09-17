import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:taste_buddy/src/widgets/recipe/recipe_share_button_widget.dart';
import '../models/recipe_model.dart';
import '../providers/recipe_provider.dart';
import '../providers/user_provider.dart';
import '../router/taste_buddy_router.dart';
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
    final success = await recipeProvider.fetchRecipes();
    if (!success) {
      setState(() => isLoading = false);
      return;
    }
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
          onPressed: () => popOrHome(context),
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
            icon: const Icon(Icons.search),
            onPressed: () => context.goNamed('search'),
          ),
          ShareButton(recipe: recipe!, baseUrl: webBaseUrl),
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
