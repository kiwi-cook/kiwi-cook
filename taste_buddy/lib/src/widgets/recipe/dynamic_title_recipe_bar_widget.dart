import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/recipe_model.dart';
import '../../providers/user_provider.dart';

class DynamicTitleRecipeAppBar extends StatelessWidget {
  final Recipe recipe;
  final ScrollController scrollController;
  final double titleThreshold;

  const DynamicTitleRecipeAppBar({
    Key? key,
    required this.recipe,
    required this.scrollController,
    required this.titleThreshold,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SliverAppBar(
      pinned: true,
      floating: false,
      title: _buildTitle(context),
      leading: const BackButton(),
      actions: _buildActions(context),
    );
  }

  Widget _buildTitle(BuildContext context) {
    return AnimatedBuilder(
      animation: scrollController,
      builder: (context, child) {
        final showTitle = scrollController.hasClients &&
            scrollController.offset > titleThreshold;
        return Opacity(
          opacity: showTitle ? 1.0 : 0.0,
          child: Text(recipe.name.getFirst()),
        );
      },
    );
  }

  List<Widget> _buildActions(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    return [
      IconButton(
        icon: Icon(
          userProvider.isFavoriteRecipe(recipe.id)
              ? Icons.favorite
              : Icons.favorite_border,
        ),
        onPressed: () => userProvider.toggleRecipeFavorite(recipe.id),
      ),
      IconButton(
        icon: const Icon(Icons.search),
        onPressed: () => Navigator.pushNamed(context, 'search'),
      ),
      IconButton(
        icon: const Icon(Icons.share),
        onPressed: () {/* Implement share functionality */},
      ),
    ];
  }
}
