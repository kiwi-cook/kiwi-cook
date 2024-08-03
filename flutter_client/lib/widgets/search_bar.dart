import 'package:flutter/material.dart';

class TasteBuddySearchBar extends StatelessWidget {
  const TasteBuddySearchBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 5,
            blurRadius: 7,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: const TextField(
        decoration: InputDecoration(
          hintText: 'Search Recipes and Ingredients',
          // Placeholder text
          hintStyle: TextStyle(color: Colors.grey),
          // Style for placeholder text
          prefixIcon: Icon(Icons.search, color: Colors.grey),
          // Search icon
          border: InputBorder.none,
          contentPadding: EdgeInsets.all(15),
        ),
        style: TextStyle(color: Colors.black), // Style for entered text
      ),
    );
  }
}
