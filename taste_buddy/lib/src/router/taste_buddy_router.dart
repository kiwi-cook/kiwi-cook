import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taste_buddy/src/screens/home_screen.dart';
import 'package:taste_buddy/src/screens/login_screen.dart';
import 'package:taste_buddy/src/screens/recipe_screen.dart';
import 'package:taste_buddy/src/screens/search_screen.dart';

// GoRouter configuration
final tasteBuddyRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      name: 'home',
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      name: 'recipe',
      path: '/recipe/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'];
        return RecipeScreen(recipeId: id);
      },
    ),
    GoRoute(
      name: 'search',
      path: '/search',
      builder: (context, state) => const SearchScreen(),
    ),
    GoRoute(
      name: 'login',
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      name: 'plan',
      path: '/plan',
      builder: (context, state) => const HomeScreen(),
    )
  ],
);

void popOrHome(BuildContext context) {
  if (Navigator.canPop(context)) {
    Navigator.pop(context);
  } else {
    context.goNamed('home');
  }
}
