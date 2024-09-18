import 'package:collection/collection.dart';
import 'package:flutter/material.dart';

import '../../models/recipe_model.dart';

class RecipeWidget extends StatefulWidget {
  final Recipe recipe;

  const RecipeWidget({required this.recipe, super.key});

  @override
  RecipeWidgetState createState() => RecipeWidgetState(recipe: recipe);
}

class RecipeWidgetState extends State<RecipeWidget> {
  final Recipe recipe;
  late int servings = recipe.servings;

  RecipeWidgetState({required this.recipe});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [

        buildTitleSection(context),
        const SizedBox(height: 16),
        buildImageSection(context),
        const SizedBox(height: 16),
        buildIngredientSection(context),
        const SizedBox(height: 16),
        buildPreparationSection(context),
      ],
    );
  }

  Widget buildTitleSection(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.person, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    'by ${recipe.src?.authors?.map((author) => author.name).join(', ') ?? 'Unknown'}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (recipe.props['tags'] != null)
              Wrap(
                spacing: 8.0,
                runSpacing: 8.0,
                children:
                    (recipe.props['tags'] as List<dynamic>).map<Widget>((tag) {
                  return Chip(
                    label: Text(tag),
                    backgroundColor: Colors.orange[50],
                    side: BorderSide(color: Colors.orange[200]!),
                    labelStyle: TextStyle(
                      color: Colors.orange[800],
                      fontSize: 12.0,
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
    );
  }

  Widget buildIngredients(BuildContext context) {
    return const Text('Ingredients');
  }

  Widget buildNutrition(BuildContext context) {
    return const Text('Nutrition');
  }

  Widget buildTags(BuildContext context) {
    return const Text('Tags');
  }

  Widget buildSteps(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: recipe.steps
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
                    const SizedBox(
                        height:
                            4), // Add some space between step number and description
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

  Widget buildImageSection(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Image.network(
            recipe.imageUrl ?? 'assets/placeholder.jpg',
            fit: BoxFit.cover,
            height: 250,
            width: double.infinity,
          ),
        ),
        Positioned(
          bottom: 16,
          right: 16,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.7),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.access_time, size: 16, color: Colors.white),
                const SizedBox(width: 4),
                Text(
                  '${recipe.duration} min',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: Colors.white,
                      ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget buildIngredientSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Ingredients',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              '${recipe.ingredients?.length ?? 0} ingredients',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Icon(Icons.people, size: 20, color: Colors.grey[600]),
            const SizedBox(width: 8),
            Text(
              '$servings Servings',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            Expanded(
              child: Slider(
                value: servings.toDouble(),
                min: 1,
                max: 20,
                divisions: 19,
                label: '$servings Servings',
                onChanged: (value) {
                  setState(() {
                    servings = value.toInt();
                    recipe.setServings(servings);
                  });
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (recipe.ingredients != null)
          Table(
            columnWidths: const {
              0: FixedColumnWidth(24),
              1: FlexColumnWidth(5),
              2: FlexColumnWidth(2),
              3: FlexColumnWidth(2),
            },
            children: [
              for (var ingredient in recipe.ingredients!)
                TableRow(
                  children: [
                    const TableCell(
                      verticalAlignment: TableCellVerticalAlignment.top,
                      child: Padding(
                        padding: EdgeInsets.only(top: 8),
                        child: Icon(Icons.check_circle_outline,
                            size: 16, color: Colors.green),
                      ),
                    ),
                    TableCell(
                      verticalAlignment: TableCellVerticalAlignment.top,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Text(
                          ingredient.ingredient.name.getFirst(),
                          style: Theme.of(context).textTheme.bodyMedium,
                          softWrap: true,
                        ),
                      ),
                    ),
                    TableCell(
                      verticalAlignment: TableCellVerticalAlignment.top,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Text(
                          '${(ingredient.userQuantity! * 40).round() / 40}',
                          style: Theme.of(context).textTheme.bodyMedium,
                          textAlign: TextAlign.right,
                        ),
                      ),
                    ),
                    TableCell(
                      verticalAlignment: TableCellVerticalAlignment.top,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            vertical: 8, horizontal: 4),
                        child: Text(
                          ingredient.unit ?? '',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),
      ],
    );
  }

  Widget buildPreparationSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Preparation',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 8),
        recipe.steps.isEmpty
            ? const Center(child: Text('No steps found'))
            : buildSteps(context)
      ],
    );
  }
}
