import 'package:flutter/material.dart';

class OnHover extends StatefulWidget {
  final Widget child;

  const OnHover({super.key, required this.child});

  @override
  OnHoverState createState() => OnHoverState();
}

class OnHoverState extends State<OnHover> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final hoveredTransform = Matrix4.identity()..scale(1.01)..rotateZ(0.02)..translate(0, 0, 0);
    final transform = _isHovered ? hoveredTransform : Matrix4.identity();

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        transform: transform,
        child: widget.child,
      ),
    );
  }
}