import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:taste_buddy/src/providers/health_provider.dart';
import 'package:taste_buddy/src/providers/recipe_provider.dart';
import 'package:taste_buddy/src/providers/user_provider.dart';
import 'src/taste_buddy_app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => HealthProvider()),
        ChangeNotifierProxyProvider<HealthProvider, RecipeProvider>(
          create: (context) => RecipeProvider(context.read<HealthProvider>()),
          update: (context, healthProvider, previousRecipeProvider) =>
            previousRecipeProvider ?? RecipeProvider(healthProvider),
        ),
        ChangeNotifierProvider(create: (_) => UserProvider()),
      ],
      child: const TasteBuddyApp(),
    ),
  );
}
