import 'package:flutter/material.dart';

class TbChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback? onPressed;

  const TbChip({
    super.key,
    required this.label,
    this.selected = false,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.7),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Text(label, style: const TextStyle(color: Colors.white)),
      ),
    );
  }
}
