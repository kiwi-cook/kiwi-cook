import 'package:flutter/material.dart';

class Searchbar extends StatelessWidget {
  final Function()? onTap;
  final Function(String)? onSearch;

  const Searchbar({
    super.key,
    this.onTap,
    this.onSearch,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search for Recipes, Ingredients, etc.',
          prefixIcon: const Icon(Icons.search),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        onChanged: (value) {
          if (onSearch != null) {
            onSearch!(value);
          }
        },
        onTap: () {
          if (onTap != null) {
            onTap!();
          }
        },
      ),
    );
  }
}
