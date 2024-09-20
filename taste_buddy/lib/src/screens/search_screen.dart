import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taste_buddy/src/router/taste_buddy_router.dart';
import 'package:taste_buddy/src/utils/search.dart';
import '../models/recipe_model.dart';
import '../providers/recipe_provider.dart';
import '../widgets/searchbar_widget.dart';

class SearchScreen extends StatefulWidget {
  final ScrollController? scrollController;

  const SearchScreen({super.key, this.scrollController});

  @override
  SearchScreenState createState() => SearchScreenState();
}

class SearchScreenState extends State<SearchScreen> {
  // List of recipes to display
  final List<Recipe> filteredRecipes = [];
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final recipeProvider = Provider.of<RecipeProvider>(context);

    void search(String query) {
      setState(() {
        _query = query;
        filteredRecipes.clear();
        if (query.isNotEmpty) {
          final results = fuzzySearch(recipeProvider.recipes, query);
          filteredRecipes.addAll(results);
        }
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Recipes'),
        // Remove the back button when shown in a modal
        automaticallyImplyLeading: widget.scrollController == null,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => popOrHome(context),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Searchbar(
              onSearch: (query) => search(query),
              autofocus: true,
            ),
          ),
          filteredRecipes.isEmpty && _query.isNotEmpty
              ? const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('No Recipes found'),
                )
              : Expanded(
                  child: ListView.builder(
                    controller: widget.scrollController,
                    itemCount: filteredRecipes.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        title: Text(filteredRecipes[index].name.getFirst()),
                        onTap: () => context
                            .push('/recipe/${filteredRecipes[index].id}'),
                      );
                    },
                  ),
                ),
        ],
      ),
    );
  }
}
