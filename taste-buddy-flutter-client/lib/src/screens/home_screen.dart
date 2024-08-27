import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:taste_buddy/src/widgets/layout/home_screen_section_widget.dart';
import '../providers/recipe_provider.dart';
import '../widgets/layout/bottom_nav_bar_widget.dart';
import '../widgets/recipe/recipe_of_the_day_widget.dart';
import '../widgets/searchbar_widget.dart';
import '../widgets/recipe/recipe_list_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<RecipeProvider>(context, listen: false).fetchRecipes();
    });
  }

  @override
  Widget build(BuildContext context) {
    final recipeProvider = Provider.of<RecipeProvider>(context);

    final shortRecipes = recipeProvider.recipes
        .where((recipe) => recipe.duration <= 20)
        .toList();

    final randomRecipes = (recipeProvider.recipes..shuffle()).take(4).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Recipe Collection'),
        centerTitle: true,
        elevation: 0,
      ),
      body: CustomScrollView(
        slivers: [
          // Search bar
          const SliverPadding(
            padding: EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: Searchbar(),
            ),
          ),

          // Recipe of the Day Section (Based on randomRecipes)
          const SliverPadding(
            padding: EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: RecipeOfTheDay(),
            ),
          ),

          // Quick Recipes Section
          const HomeScreenSection(title: 'Quick recipes', subtitle: 'Ready in 20 minutes or less'),
          RecipeList(recipes: shortRecipes, inSliver: true),

          // Random Recipes Section
          const HomeScreenSection(title: 'Surprise me'),
          RecipeList(recipes: randomRecipes, inSliver: true),

          // TODO: Implement Friends' Recipes Section
        ],
      ),
      // TODO: Implement Bottom Navigation Bar
      // bottomNavigationBar: const BottomNavBar(),
    );
  }
}
