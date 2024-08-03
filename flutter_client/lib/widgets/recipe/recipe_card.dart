import 'package:flutter/material.dart';
import 'package:taste_buddy_client/models/recipe.dart';
import 'package:taste_buddy_client/widgets/chip.dart';
import 'package:taste_buddy_client/widgets/on_hover.dart';

class RecipeCard extends StatelessWidget {
  final Recipe recipe;

  const RecipeCard({super.key, required this.recipe});

  @override
  Widget build(BuildContext context) {
    return OnHover(
        child: Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          child: Stack(
            fit: StackFit.expand,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(15),
                child: Image.network(recipe.imageUrl?.toString() ?? '',
                    fit: BoxFit.cover),
              ),
              Positioned(
                bottom: 10,
                left: 10,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (recipe.getName().length <= 20)
                      Text(recipe.getName(),
                          style: const TextStyle(
                              color: Colors.white, fontWeight: FontWeight.bold)),
                    if (recipe.getName().length > 20)
                      Text('${recipe.getName().substring(0, 20)}...',
                          style: const TextStyle(
                              color: Colors.white, fontWeight: FontWeight.bold)),
                    TbChip(label: '${recipe.duration.toString()} min.'),
                  ],
                ),
              ),
            ],
          ),
        ));
  }
}