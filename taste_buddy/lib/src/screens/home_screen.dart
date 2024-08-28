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

    // Filter recipes that take 20 minutes or less
    final shortRecipes = recipeProvider.recipes
        .where((recipe) => recipe.duration <= 20)
        .toList();

    // Randomly select 4 recipes
    final randomRecipes = (recipeProvider.recipes..shuffle()).take(4).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hey Buddy!'),
        centerTitle: false,
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
          const HomeScreenSection(
              title: 'Quick Recipes', subtitle: '20 minutes or less'),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RecipeList(recipes: shortRecipes),
                ],
              ),
            ),
          ),

          // Quick Recipes Section
          const HomeScreenSection(
              title: 'Surprise Me'),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RecipeList(recipes: randomRecipes),
                ],
              ),
            ),
          ),


          // TODO: Implement Friends' Recipes Section
        ],
      ),
      // TODO: Implement Bottom Navigation Bar
      bottomNavigationBar: const BottomNavBar(),
    );
  }
}
