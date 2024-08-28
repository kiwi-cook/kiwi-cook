import 'package:go_router/go_router.dart';
import 'package:taste_buddy/src/screens/home_screen.dart';
import 'package:taste_buddy/src/screens/recipe_screen.dart';

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
      name: 'plan',
      path: '/plan',
      builder: (context, state) => const HomeScreen(),
    )
  ],
);
