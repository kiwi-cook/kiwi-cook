import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taste_buddy/src/widgets/layout/home_screen_section_widget.dart';
import '../providers/recipe_provider.dart';
import '../providers/user_provider.dart';
import '../widgets/recipe/recipe_of_the_day_widget.dart';
import '../widgets/recipe/recipe_list_widget.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(context),
      body: _buildBody(context),
    );
  }

  String _getGreeting(String? username) {
    final hour = DateTime.now().hour;
    if (hour >= 5 && hour < 12) {
      return username != null
          ? 'Rise and shine, $username!'
          : 'Rise and shine, sunshine!';
    } else if (hour >= 12 && hour < 17) {
      return username != null
          ? 'Fancy seeing you here, $username!'
          : 'Fancy seeing you here!';
    } else if (hour >= 17 && hour < 21) {
      return username != null
          ? 'Evening, $username, you party animal!'
          : 'Evening, party animal!';
    } else if (hour >= 21 || hour < 1) {
      return username != null
          ? 'Still awake, $username? High five!'
          : 'Still awake? High five!';
    } else {
      return username != null
          ? 'Ah, $username, a fellow vampire!'
          : 'Ah, a fellow vampire!';
    }
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      title: Selector<UserProvider, String?>(
        selector: (_, provider) =>
            provider.isLoggedIn ? provider.user.username : null,
        builder: (context, username, _) {
          return Text(
            _getGreeting(username),
            style: Theme.of(context).textTheme.titleLarge,
          );
        },
      ),
      centerTitle: false,
      elevation: 0,
      actions: [
        /*IconButton(
          icon: const Icon(Icons.abc),
          onPressed: () => context.goNamed('plan'),
        ), */
        IconButton(
          icon: const Icon(Icons.search),
          onPressed: () => context.goNamed('search'),
        ),
        Consumer<UserProvider>(
          builder: (context, userProvider, _) => IconButton(
            icon: Icon(userProvider.isLoggedIn ? Icons.logout : Icons.login),
            onPressed: () {
              if (userProvider.isLoggedIn) {
                userProvider.logout();
              } else {
                context.goNamed('login');
              }
            },
          ),
        ),
      ],
    );
  }

  Widget _buildBody(BuildContext context) {
    return CustomScrollView(
      slivers: [
        const SliverPadding(
          padding: EdgeInsets.all(16.0),
          sliver: SliverToBoxAdapter(child: RecipeOfTheDay()),
        ),
        const HomeScreenSection(
          title: 'Quick Recipes',
          subtitle: '20 minutes or less',
        ),
        _buildQuickRecipes(),
        ..._buildFavorites(),
        const HomeScreenSection(title: 'Surprise Me'),
        _buildRandomRecipes(),
      ],
    );
  }

  Widget _buildQuickRecipes() {
    return Consumer<RecipeProvider>(
      builder: (context, recipeProvider, _) {
        final shortRecipes = recipeProvider.getShortRecipes();
        return SliverPadding(
          padding: const EdgeInsets.all(16.0),
          sliver: SliverToBoxAdapter(
            child: RecipeList(recipes: shortRecipes),
          ),
        );
      },
    );
  }

  List<Widget> _buildFavorites() {
    return [
      Consumer<UserProvider>(
        builder: (context, userProvider, _) {
          final favoriteRecipes = userProvider.getFavoriteRecipes();
          if (favoriteRecipes.isEmpty) {
            return const SliverToBoxAdapter(child: SizedBox.shrink());
          }
          return const HomeScreenSection(
            title: 'Favorites',
            subtitle: 'Your saved recipes',
          );
        },
      ),
      Consumer<UserProvider>(
        builder: (context, userProvider, _) {
          final favoriteRecipes = userProvider.getFavoriteRecipes();
          if (favoriteRecipes.isEmpty) {
            return const SliverToBoxAdapter(child: SizedBox.shrink());
          }
          return SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            sliver: SliverToBoxAdapter(
              child: RecipeList(recipes: favoriteRecipes),
            ),
          );
        },
      ),
    ];
  }

  Widget _buildRandomRecipes() {
    return Consumer<RecipeProvider>(
      builder: (context, recipeProvider, _) {
        final randomRecipes = recipeProvider.getRandomRecipes(max: 4);
        return SliverPadding(
          padding: const EdgeInsets.all(16.0),
          sliver: SliverToBoxAdapter(
            child: RecipeList(recipes: randomRecipes),
          ),
        );
      },
    );
  }
}
