import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

/// The Widget that configures your application.
class TasteBuddyApp extends StatelessWidget {
  const TasteBuddyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Taste Buddy',
        theme: ThemeData.dark().copyWith(
            scaffoldBackgroundColor: Colors.black,
            primaryColor: Colors.greenAccent,
            textTheme: const TextTheme(
              headlineSmall: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              headlineMedium: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
              headlineLarge: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            brightness: Brightness.dark),
        home: const HomeScreen());
  }
}