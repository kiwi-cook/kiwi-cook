import 'package:flutter/material.dart';
import 'package:taste_buddy_client/widgets/navigation/bottom_nav.dart';
import 'package:taste_buddy_client/widgets/recipe/recipe_grid.dart';
import 'package:taste_buddy_client/widgets/search_bar.dart';

class RecipesHomePage extends StatelessWidget {
  const RecipesHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Row(
          children: [
            Expanded(child: Container()), // Left margin
            const Expanded(
              flex: 8,
              // Adjust flex value to control the width of the central content
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Hey Buddy!',
                        style: TextStyle(fontSize: 18, color: Colors.grey)),
                    Text('Discover new recipes',
                        style: TextStyle(
                            fontSize: 24, fontWeight: FontWeight.bold)),
                    SizedBox(height: 16),
                    TasteBuddySearchBar(),
                    SizedBox(height: 24),
                    // const RecipeOfTheDay(),
                    SizedBox(height: 24),
                    Text('Explore new recipes',
                        style: TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold)),
                    Text('Surprise me!', style: TextStyle(color: Colors.grey)),
                    SizedBox(height: 16),
                    Expanded(child: RecipeGrid()),
                    BottomNavBar(),
                  ],
                ),
              ),
            ),
            Expanded(child: Container()), // Right margin
          ],
        ),
      ),
    );
  }
}
