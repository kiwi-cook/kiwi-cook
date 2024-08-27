import 'package:flutter/material.dart';

import '../models/recipe_model.dart';
import '../widgets/searchbar_widget.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  _SearchScreenState createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {

  // List of recipes to display
  final List<Recipe> filteredRecipes = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Recipes'),
      ),
      body: Column(
        children: [
          Searchbar(),
          Expanded(
            child: ListView.builder(
              itemCount: filteredRecipes.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(filteredRecipes[index].name.getFirst()),
                  // Additional details or actions
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
