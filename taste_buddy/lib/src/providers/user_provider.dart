import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:taste_buddy/src/utils/fetch.dart';
import '../models/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserProvider with ChangeNotifier {
  User _user = User();
  User get user => _user;
  String get accessToken => _accessToken;
  bool get isLoggedIn => _accessToken.isNotEmpty;

  String _accessToken = '';
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  // Constructor
  UserProvider() {
    _initializeUser();
  }

  // Initialize user data
  Future<void> _initializeUser() async {
    await loadToken();
    if (_accessToken.isNotEmpty) {
      await fetchUser();
    }
  }

  Future<void> authenticate(String username, String password) async {
    try {
      final token = await sendRequest('/users/token',
          method: 'POST',
          body: {
            'username': username,
            'password': password,
          },
          isFormData: true) as Map<String, dynamic>;
      final accessToken = token['access_token'] as String;
      saveToken(accessToken);
      await fetchUser();
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to authenticate: $e');
    }
  }

  Future<void> loadToken() async {
    try {
      String? loadedToken;
      if (!kIsWeb) {
        // Use flutter_secure_storage for mobile platforms
        loadedToken = await _secureStorage.read(key: "jwt");
      } else {
        // Use shared_preferences for web platform
        final prefs = await SharedPreferences.getInstance();
        loadedToken = prefs.getString('jwt');
      }

      if (loadedToken != _accessToken) {
        _accessToken = loadedToken ?? '';
        notifyListeners();
      }
    } catch (e) {
      print('Error loading token: $e');
      // Fallback to SharedPreferences if FlutterSecureStorage fails
      if (!kIsWeb) {
        final prefs = await SharedPreferences.getInstance();
        _accessToken = prefs.getString('jwt') ?? '';
        notifyListeners();
      }
    }
  }

  Future<void> saveToken(String? token) async {
    if (token == null) {
      return;
    }

    _accessToken = token;

    try {
      if (!kIsWeb) {
        // Use flutter_secure_storage for mobile platforms
        await _secureStorage.write(key: "jwt", value: token);
      } else {
        // Use shared_preferences for web platform
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt', token);
      }
    } catch (e) {
      print('Error saving token: $e');
      // Fallback to SharedPreferences if FlutterSecureStorage fails
      if (!kIsWeb) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt', token);
      }
    }

    notifyListeners();
  }

  Future<void> fetchUser() async {
    if (_accessToken.isEmpty) {
      return; // Don't fetch if there's no token
    }
    try {
      final jsonResponse = await sendRequest('/users/me',
          method: 'GET', body: {}, accessToken: _accessToken);
      _user = User.fromJson(jsonResponse);
      print('User: ${_user.username}');
      notifyListeners();
    } catch (e) {
      print('Failed to load user: $e');
      // Optionally, you can clear the token if it's invalid
      // await logout();
    }
  }

  void logout() {
    _accessToken = '';
    _user = User();
    notifyListeners();
  }

  Future<void> toggleRecipeFavorite(String recipeId) async {
    try {
      if (_user.recipes.contains(recipeId)) {
        print('Removing recipe $recipeId');
        _user.recipes.remove(recipeId);
        await sendRequest('/users/me/recipes/remove/',
            method: 'POST',
            body: {'recipe_id': recipeId},
            isFormData: true,
            accessToken: _accessToken);
      } else {
        print('Adding recipe $recipeId');
        _user.recipes.add(recipeId);
        await sendRequest('/users/me/recipes/add/',
            method: 'POST',
            body: {'recipe_id': recipeId},
            isFormData: true,
            accessToken: _accessToken);
      }
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to toggle favorite: $e');
    }
  }

  bool isFavoriteRecipe(String recipeId) {
    return _user.recipes.contains(recipeId);
  }
}
