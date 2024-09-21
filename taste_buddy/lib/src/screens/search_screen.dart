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
  final String? initialQuery;

  const SearchScreen({super.key, this.scrollController, this.initialQuery});

  @override
  SearchScreenState createState() => SearchScreenState();
}

class SearchScreenState extends State<SearchScreen> {
  final List<Recipe> filteredRecipes = [];
  late String _query;
  late TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _query = widget.initialQuery ?? '';
    _searchController = TextEditingController(text: _query);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_query.isNotEmpty) {
        search(_query);
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void search(String query) {
    final recipeProvider = Provider.of<RecipeProvider>(context, listen: false);
    setState(() {
      _query = query;
      filteredRecipes.clear();
      if (query.isNotEmpty) {
        final results = fuzzySearch(recipeProvider.recipes, query);
        filteredRecipes.addAll(results);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Recipes'),
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
