import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:taste_buddy/src/providers/recipe_provider.dart';

import 'src/taste_buddy_app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => RecipeProvider()),
      ],
      child: const TasteBuddyApp(),
    ),
  );
}
