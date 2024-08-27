import 'package:flutter/material.dart';

class RecipeSteps extends StatelessWidget {
  final List<String> steps;

  const RecipeSteps({Key? key, required this.steps}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: steps
          .map((step) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Text(
                  step,
                  style: Theme.of(context).textTheme.bodyMedium
                ),
              ))
          .toList(),
    );
  }
}
