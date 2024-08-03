import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:taste_buddy_client/screens/home_page.dart';

void main() {
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    exit(1);
  };

  LicenseRegistry.addLicense(() async* {
    final license = await rootBundle.loadString('google_fonts/OFL.txt');
    yield LicenseEntryWithLineBreaks(['google_fonts'], license);
  });

  runApp(
    const ProviderScope(
      child: TasteBuddyApp(),
    ),
  );
}

class TasteBuddyApp extends StatelessWidget {
  const TasteBuddyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        primarySwatch: Colors.green,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const RecipesHomePage(),
    );
  }
}
