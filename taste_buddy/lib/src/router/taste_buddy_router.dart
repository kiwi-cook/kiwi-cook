import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:go_router/go_router.dart';
import 'package:taste_buddy/src/screens/home_screen.dart';
import 'package:taste_buddy/src/screens/login_screen.dart';
import 'package:taste_buddy/src/screens/plan_screen.dart';
import 'package:taste_buddy/src/screens/recipe_screen.dart';
import 'package:taste_buddy/src/screens/search_screen.dart';

void configureApp() {
  if (kIsWeb) {
    setUrlStrategy(const PathUrlStrategy());
  }
}

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
      builder: (context, state) {
        final query = state.uri.queryParameters['q'];
        return SearchScreen(initialQuery: query);
      },
    ),
    GoRoute(
      name: 'login',
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      name: 'plan',
      path: '/plan',
      builder: (context, state) => const PlanScreen(),
    )
  ],
  errorBuilder: (context, state) => ErrorScreen(error: state.error),
);

void popOrHome(BuildContext context) {
  if (Navigator.canPop(context)) {
    Navigator.pop(context);
  } else {
    context.goNamed('home');
  }
}

class ErrorScreen extends StatelessWidget {
  final Exception? error;

  const ErrorScreen({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Text('An error occurred: ${error?.toString() ?? 'Unknown error'}'),
      ),
    );
  }
}
