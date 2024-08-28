import 'package:flutter/material.dart';
import '../../models/recipe_model.dart';
import 'recipe_preview_widget.dart';

class RecipeList extends StatelessWidget {
  final List<Recipe> recipes;

  const RecipeList({super.key, required this.recipes});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 250, // Set a fixed height for the horizontal list
      child: ListView.builder(
        scrollDirection: Axis.horizontal, // Horizontal scrolling
        itemCount: recipes.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(right: 16.0), // Space between items
            child: SizedBox(
              width: 200, // Fixed width for each item
              child: RecipePreview(
                recipe: recipes[index],
              ),
            ),
          );
        },
      ),
    );
  }
}
