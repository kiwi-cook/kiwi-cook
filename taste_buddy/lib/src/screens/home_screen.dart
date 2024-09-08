import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taste_buddy/src/screens/search_screen.dart';
import 'package:taste_buddy/src/widgets/layout/home_screen_section_widget.dart';
import '../providers/recipe_provider.dart';
import '../providers/user_provider.dart';
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
    final userProvider = Provider.of<UserProvider>(context);

    final shortRecipes = recipeProvider.recipes
        .where((recipe) => recipe.duration <= 20)
        .toList();

    final randomRecipes = (recipeProvider.recipes..shuffle()).take(4).toList();

    final favoriteRecipes = recipeProvider.recipes
        .where((recipe) => userProvider.user.recipes.contains(recipe.id))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: userProvider.isLoggedIn
            ? Text('Welcome ${userProvider.user.username}')
            : const Text('Hey Buddy'),
        centerTitle: false,
        elevation: 0,
        actions: [
          // TODO: Implement favorites screen
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.goNamed('search'),
          ),
          IconButton(
              icon: Icon(userProvider.isLoggedIn ? Icons.logout : Icons.login),
              onPressed: () => {
                    if (userProvider.isLoggedIn)
                      userProvider.logout()
                    else
                      context.goNamed('login'),
                  })
        ],
      ),
      body: CustomScrollView(
        slivers: [
          const SliverPadding(
            padding: EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: RecipeOfTheDay(),
            ),
          ),
          const HomeScreenSection(
            title: 'Quick Recipes',
            subtitle: '20 minutes or less',
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: RecipeList(recipes: shortRecipes),
            ),
          ),
          favoriteRecipes.isNotEmpty
              ? const HomeScreenSection(
                  title: 'Favorites', subtitle: 'Your saved recipes')
              : const SliverToBoxAdapter(child: SizedBox(height: 0)),
          favoriteRecipes.isNotEmpty
              ? SliverPadding(
                  padding: const EdgeInsets.all(16.0),
                  sliver: SliverToBoxAdapter(
                    child: RecipeList(recipes: favoriteRecipes),
                  ),
                )
              : const SliverToBoxAdapter(child: SizedBox(height: 0)),
          const HomeScreenSection(title: 'Surprise Me'),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: RecipeList(recipes: randomRecipes),
            ),
          ),
        ],
      ),
      //bottomNavigationBar: const BottomNavBar(),
    );
  }
}
