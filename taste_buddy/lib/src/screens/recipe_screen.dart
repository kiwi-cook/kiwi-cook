import 'package:flutter/material.dart';
import 'package:taste_buddy/src/widgets/recipe/recipe_steps_widget.dart';
import '../models/recipe_model.dart';

class RecipeScreen extends StatefulWidget {
  final Recipe recipe;

  RecipeScreen({required this.recipe});

  @override
  _RecipeScreenState createState() => _RecipeScreenState(recipe: recipe);
}

class _RecipeScreenState extends State<RecipeScreen> {
  final Recipe recipe;

  _RecipeScreenState({required this.recipe});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: recipe.name.getFirst(),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.greenAccent),
          onPressed: () {},
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.favorite_border, color: Colors.greenAccent),
            onPressed: () {},
          ),
          IconButton(
            icon: Icon(Icons.share, color: Colors.greenAccent),
            onPressed: () {},
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title Section
              Text(
                recipe.name.getFirst(),
                style: Theme.of(context).textTheme.headlineLarge
              ),
              SizedBox(height: 8),
              Text(
                // TODO: Replace with the actual author
                'by nobody',
                style: Theme.of(context).textTheme.bodySmall
              ),
              SizedBox(height: 8),
              recipe.tags == null ? Container() :
              Row(
                children: recipe.tags!.map((tag) {
                  return Container(
                    margin: EdgeInsets.only(right: 8),
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.greenAccent,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      tag,
                      style: TextStyle(color: Colors.white),
                    ),
                  );
                }).toList(),
              ),
              SizedBox(height: 16),

              // Image Section
              Row(
                children: [
                  Expanded(
                    child: Image.network(
                      recipe.imageUrl ?? 'assets/placeholder.jpg',
                      fit: BoxFit.cover,
                      height: 200,
                    ),
                  ),
                  SizedBox(width: 16),
                  Column(
                    children: [
                      Icon(Icons.access_time,
                              size: 16, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Text(
                            '${recipe.duration} min',
                            style: Theme.of(context).textTheme.labelMedium,
                          ),
                    ],
                  ),
                ],
              ),
              SizedBox(height: 16),

              // Ingredients Section
              Text(
                '${recipe.ingredients?.length} Ingredients',
                style: Theme.of(context).textTheme.bodyMedium
              ),
              SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '${recipe.servings} Servings',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                  Slider(
                    value: 14,
                    min: 1,
                    max: 20,
                    divisions: 19,
                    label: '14',
                    onChanged: (value) {},
                  ),
                ],
              ),
              SizedBox(height: 8),
              // List of Ingredients
              //IngredientsList(),

              SizedBox(height: 16),

              // Preparation Section
              Text(
                'Preparation',
                style: Theme.of(context).textTheme.bodyMedium
              ),
              SizedBox(height: 8),
              RecipeSteps(steps: recipe.steps)
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: 'Favorites',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.explore),
            label: 'Explore',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
        selectedItemColor: Colors.greenAccent,
      ),
    );
  }
}