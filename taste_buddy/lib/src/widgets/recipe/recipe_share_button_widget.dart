import 'dart:io';

import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:taste_buddy/src/models/recipe_model.dart';

class ShareButton extends StatelessWidget {
  final Recipe recipe;
  final String baseUrl;

  const ShareButton({
    super.key,
    required this.recipe,
    required this.baseUrl,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.share),
      onPressed: () async {
        final box = context.findRenderObject() as RenderBox?;

        // Generate the appropriate link based on platform
        final String link;
        if (kIsWeb) {
          // For web, use GoRouter to generate the full URL
          link = Uri.parse(baseUrl).resolveUri(Uri.parse(
            GoRouter.of(context).namedLocation(
              'recipe',
              pathParameters: {'id': recipe.id.toString()},
            )
          )).toString();
        } else {
          // For mobile apps, use a deep link
          // TODO: Replace with your app's scheme
          final scheme = Platform.isIOS ? 'ios-scheme' : 'android-scheme';
          link = '$scheme://${GoRouter.of(context).namedLocation(
            'recipe',
            pathParameters: {'id': recipe.id.toString()},
          )}';
        }

        // Add UTM parameters
        final uriWithUtm = Uri.parse(link).replace(
          queryParameters: {
            ...Uri.parse(link).queryParameters,
            'utm_source': 'share',
            'utm_medium': kIsWeb ? 'web' : 'app',
            'utm_campaign': 'recipe_share',
          },
        ).toString();

        await Share.share(
          'Check out this recipe: ${recipe.name.getFirst()}\n\nLink: $uriWithUtm',
          subject: 'Amazing Recipe: ${recipe.name}',
          sharePositionOrigin: box!.localToGlobal(Offset.zero) & box!.size,
        );
      },
    );
  }
}

// Usage example:
// ShareButton(
//   recipe: recipeObject,
//   baseUrl: 'https://yourwebsite.com',
// )
