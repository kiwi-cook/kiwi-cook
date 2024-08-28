import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../models/recipe_model.dart';
import '../../providers/recipe_provider.dart';

class RecipeOfTheDay extends StatelessWidget {
  const RecipeOfTheDay({super.key});

  @override
  Widget build(BuildContext context) {
    final recipeProvider = Provider.of<RecipeProvider>(context);
    final recipeOfTheDay = recipeProvider.recipeOfTheDay();

    if (recipeOfTheDay == null) {
      return const SizedBox();
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWideScreen = constraints.maxWidth > 600;

        return Card(
          elevation: 8,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: isWideScreen
                ? _buildWideLayout(context, recipeOfTheDay)
                : _buildNarrowLayout(context, recipeOfTheDay),
          ),
        );
      },
    );
  }

  Widget _buildWideLayout(BuildContext context, Recipe recipeOfTheDay) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 3,
          child: _buildImage(recipeOfTheDay),
        ),
        const SizedBox(width: 16),
        Expanded(
          flex: 2,
          child: _buildContent(context, recipeOfTheDay),
        ),
      ],
    );
  }

  Widget _buildNarrowLayout(BuildContext context, Recipe recipeOfTheDay) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildImage(recipeOfTheDay),
        const SizedBox(height: 16),
        _buildContent(context, recipeOfTheDay),
      ],
    );
  }

  Widget _buildImage(Recipe recipeOfTheDay) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Image.network(
        recipeOfTheDay.imageUrl ?? 'assets/placeholder.jpg',
        height: 250,
        width: double.infinity,
        fit: BoxFit.cover,
      ),
    );
  }

  Widget _buildContent(BuildContext context, Recipe recipeOfTheDay) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recipe of the Day',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: Colors.orange,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          recipeOfTheDay.name.getFirst(),
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Time: ${recipeOfTheDay.duration} mins',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(
          recipeOfTheDay.description.getFirst(),
          style: Theme.of(context).textTheme.bodyMedium,
          maxLines: 3,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: () => context.push('/recipe/${recipeOfTheDay.id}'),
          style: ElevatedButton.styleFrom(
            foregroundColor: Colors.white, backgroundColor: Colors.orange,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30),
            ),
          ),
          icon: const Icon(Icons.restaurant_menu),
          label: const Text(
            'View Full Recipe',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
      ],
    );
  }
}