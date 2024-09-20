import 'package:flutter/material.dart';

class HomeScreenSection extends StatelessWidget {
  final String title;
  final String? subtitle;

  const HomeScreenSection({
    super.key,
    required this.title,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 8.0),
      sliver: SliverToBoxAdapter(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.orangeAccent,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(
                subtitle!,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
