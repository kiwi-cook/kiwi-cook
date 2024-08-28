import 'package:flutter/material.dart';

class Searchbar extends StatelessWidget {
  final Function(String)? onChangedCallback;
  final Function(String)? onSubmittedCallback;

  const Searchbar({
    super.key,
    this.onChangedCallback,
    this.onSubmittedCallback,
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
          if (onChangedCallback != null) {
            onChangedCallback!(value);
          }
        },
        onSubmitted: (value) {
          if (onSubmittedCallback != null) {
            onSubmittedCallback!(value);
          }
        },
      ),
    );
  }
}
