import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:taste_buddy_client/states/recipe_state.dart';
import 'package:taste_buddy_client/widgets/recipe/recipe_card.dart';

class RecipeGrid extends ConsumerWidget {
  const RecipeGrid({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recipeListAsyncValue = ref.watch(recipeListProvider);
    print('RecipeGrid: $recipeListAsyncValue');

    return LayoutBuilder(
      builder: (context, constraints) {
        // Determine the number of columns based on the available width
        int crossAxisCount = constraints.maxWidth < 600 ? 1 : 2;

        return recipeListAsyncValue.when(
          data: (recipes) => GridView.builder(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              childAspectRatio: 1,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
            ),
            itemCount: recipes.length,
            itemBuilder: (context, index) {
              final recipe = recipes[index];
              return RecipeCard(recipe: recipe);
            },
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(child: Text('Error: $error')),
        );
      },
    );
  }
}




