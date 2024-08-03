import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:taste_buddy_client/models/recipe.dart';
import 'package:taste_buddy_client/states/recipe_state.dart';

class RecipeOfTheDay extends ConsumerWidget {
  const RecipeOfTheDay({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recipeListAsyncValue = ref.watch(recipeListProvider);
    print('RecipeGrid: $recipeListAsyncValue');

    // Calculate the day of the year
    DateTime now = DateTime.now();
    DateTime start = DateTime(now.year, 1, 1);
    int diff = now.difference(start).inMilliseconds +
        ((start.timeZoneOffset.inMilliseconds -
            now.timeZoneOffset.inMilliseconds));
    int oneDay = 1000 * 60 * 60 * 24;
    int day = (diff / oneDay).floor();

    // Sort array pseudo-randomly
    int state = 5021 % 2147483647;
    if (state <= 0) {
      state += 2147483646;
    }

    return recipeListAsyncValue.when(
      data: (recipes) => Container(
        height: 200,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15),
          image: DecorationImage(
            image: NetworkImage(recipes[day % recipes.length].imageUrl.toString()),
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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Recipe of the Day',
                      style: GoogleFonts.roboto(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      recipes[day % recipes.length].getName(),
                      style: GoogleFonts.roboto(
                        color: Colors.grey,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(child: Text('Error: $error')),
    );
  }
}