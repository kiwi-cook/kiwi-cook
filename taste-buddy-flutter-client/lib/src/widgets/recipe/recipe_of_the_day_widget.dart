import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/recipe_provider.dart';

class RecipeOfTheDay extends StatefulWidget {
  const RecipeOfTheDay({Key? key}) : super(key: key);

  @override
  _RecipeOfTheDayState createState() => _RecipeOfTheDayState();
}

class _RecipeOfTheDayState extends State<RecipeOfTheDay> {


  @override
  Widget build(BuildContext context) {
    final recipeProvider = Provider.of<RecipeProvider>(context);
    final recipeOfTheDay = recipeProvider.recipeOfTheDay();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Image.network(
          recipeOfTheDay.imageUrl ?? 'assets/placeholder.jpg',
          height: 200,
          width: double.infinity,
          fit: BoxFit.cover,
        ),
        const SizedBox(height: 10),
        Text(
          'Recipe of the day',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: Colors.greenAccent,
              ),
        ),
        Text(
          recipeOfTheDay.name.getFirst(),
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 10),
        ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.greenAccent,
          ),
          child: const Text('View Recipe'),
        ),
      ],
    );
  }
}
