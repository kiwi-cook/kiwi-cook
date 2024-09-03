import 'package:flutter/material.dart';
import 'router/taste_buddy_router.dart';

class TasteBuddyApp extends StatelessWidget {
  const TasteBuddyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Taste Buddy',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: const ColorScheme.light(
          primary: Colors.orange,
          onPrimary: Colors.white,
          secondary: Colors.orangeAccent,
          onSecondary: Colors.black,
          surface: Colors.white,
          onSurface: Colors.black,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.dark(
          primary: Colors.orange,
          onPrimary: Colors.black,
          secondary: Colors.orangeAccent,
          onSecondary: Colors.white,
          surface: Colors.grey[900]!,
          onSurface: Colors.white,
        ),
      ),
      themeMode: ThemeMode.system,
      routerConfig: tasteBuddyRouter,
    );
  }
}
