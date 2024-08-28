import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/recipe_model.dart';
import '../providers/recipe_provider.dart';
import '../widgets/searchbar_widget.dart';

class SearchScreen extends StatefulWidget {
  final ScrollController? scrollController;

  const SearchScreen({Key? key, this.scrollController}) : super(key: key);

  @override
  _SearchScreenState createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  // List of recipes to display
  final List<Recipe> filteredRecipes = [];

  @override
  Widget build(BuildContext context) {
    final recipeProvider = Provider.of<RecipeProvider>(context);

    void search(String query) {
      filteredRecipes.clear();
      if (query.isEmpty) {
        setState(() {});
        return;
      }


      for (var recipe in recipeProvider.recipes) {
        if (recipe.name.getFirst().contains(query)) {
          filteredRecipes.add(recipe);
        }
      }

      setState(() {});
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Recipes'),
        // Remove the back button when shown in a modal
        automaticallyImplyLeading: widget.scrollController == null,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Searchbar(
              onSearch: (query) => search(query),
            ),
          ),
          Expanded(
            child: ListView.builder(
              controller: widget.scrollController,
              itemCount: filteredRecipes.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(filteredRecipes[index].name.getFirst()),
                  onTap: () => context.push('/recipe/${filteredRecipes[index].id}'),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}