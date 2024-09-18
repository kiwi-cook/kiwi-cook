import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:taste_buddy/src/widgets/recipe/dynamic_title_recipe_bar_widget.dart';
import '../models/recipe_model.dart';
import '../providers/recipe_provider.dart';
import '../widgets/recipe/recipe_widget.dart';

class RecipeScreen extends StatelessWidget {
  final String? recipeId;

  const RecipeScreen({super.key, required this.recipeId});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Recipe?>(
      future: _loadRecipe(context),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const _LoadingScreen();
        }

        final recipe = snapshot.data;
        if (recipe == null) {
          return const _ErrorScreen();
        }

        return _RecipeContent(recipe: recipe);
      },
    );
  }

  Future<Recipe?> _loadRecipe(BuildContext context) async {
    if (recipeId == null) return null;
    final recipeProvider = Provider.of<RecipeProvider>(context, listen: false);
    final success = await recipeProvider.fetchRecipes();
    return success ? recipeProvider.findById(recipeId!) : null;
  }
}

class _LoadingScreen extends StatelessWidget {
  const _LoadingScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class _ErrorScreen extends StatelessWidget {
  const _ErrorScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const BackButton(),
        title: const Text("Recipe not found"),
      ),
      body: const Center(child: Text("Recipe could not be loaded.")),
    );
  }
}

class _RecipeContent extends StatefulWidget {
  final Recipe recipe;

  const _RecipeContent({Key? key, required this.recipe}) : super(key: key);

  @override
  _RecipeContentState createState() => _RecipeContentState();
}

class _RecipeContentState extends State<_RecipeContent> {
  late ScrollController _scrollController;
  final GlobalKey _recipeTitleKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) => _calculateTitleThreshold());
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _calculateTitleThreshold() {
    final RenderBox? renderBox = _recipeTitleKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox != null) {
      final titlePosition = renderBox.localToGlobal(Offset.zero);
      final titleThreshold = titlePosition.dy - AppBar().preferredSize.height;
      setState(() {
        _titleThreshold = titleThreshold;
      });
    }
  }

  double _titleThreshold = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: <Widget>[
          DynamicTitleRecipeAppBar(
            recipe: widget.recipe,
            scrollController: _scrollController,
            titleThreshold: _titleThreshold,
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.recipe.name.getFirst(),
                    key: _recipeTitleKey,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 16),
                  RecipeWidget(
                    recipe: widget.recipe,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
