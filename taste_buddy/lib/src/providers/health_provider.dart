import 'package:flutter/material.dart';
import 'dart:async';
import 'package:taste_buddy/src/utils/fetch.dart';

class HealthProvider with ChangeNotifier {
  bool _isHealthy = false;
  Timer? _timer;

  bool get isHealthy => _isHealthy;

  HealthProvider() {
    // Start checking health immediately and then every 30 seconds
    checkHealth();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => checkHealth());
  }

  Future<void> checkHealth() async {
    try {
      String status = await sendRequest('/health', method: 'GET') as String;
      _isHealthy = status == 'OK';
    } catch (e) {
      _isHealthy = false;
    }
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
