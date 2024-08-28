import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import '../../models/recipe_model.dart';

class RecipeSteps extends StatelessWidget {
  final List<RecipeStep> steps;
  
  const RecipeSteps({super.key, required this.steps});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: steps
          .mapIndexed((stepIndex, step) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Step ${stepIndex + 1}',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4), // Add some space between step number and description
                    Text(
                      step.description.getFirst(),
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ))
          .toList(),
    );
  }
}