import 'package:flutter/material.dart';
import 'package:taste_buddy_client/models/recipe.dart';
class RecipeOfTheDay extends StatelessWidget {
  final Recipe recipe;

  const RecipeOfTheDay({
    super.key,
    required this.recipe,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(15),
        image: const DecorationImage(
          image: NetworkImage(
              'https://images.unsplash.com/photo-1556912173-3b5d3e2b9bd1'),
          fit: BoxFit.cover,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            bottom: 10,
            left: 10,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              color: Colors.black.withOpacity(0.7),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Recipe of the day',
                      style: TextStyle(color: Colors.white)),
                  Text('By Ergobiene',
                      style: TextStyle(
                          color: Colors.white, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

