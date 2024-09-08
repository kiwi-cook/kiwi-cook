import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';

class UserProvider with ChangeNotifier {
  User _user = User();
  String _accessToken = '';
  User get user => _user;
  String get accessToken => _accessToken;
  bool get isLoggedIn => _accessToken.isNotEmpty;

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

  Future<Map<String, dynamic>> _sendAuthenticatedRequest(
    String endpoint, {
    required String method,
    Map<String, dynamic>? body,
    bool isFormData = false,
  }) async {
    if (_accessToken.isEmpty) {
      throw Exception('No access token available. Please authenticate first.');
    }

    const baseUrl =
        kDebugMode ? 'http://127.0.0.1:8000' : 'https://taste-buddy.uk';
    final uri = Uri.parse('$baseUrl$endpoint');

    final headers = {
      'Authorization': 'Bearer $_accessToken',
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    http.Response response;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await http.get(uri, headers: headers);
        break;
      case 'POST':
        if (isFormData) {
          response = await http.post(uri, headers: headers, body: body);
        } else {
          response =
              await http.post(uri, headers: headers, body: jsonEncode(body));
        }
        break;
      case 'PUT':
        response =
            await http.put(uri, headers: headers, body: jsonEncode(body));
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
        break;
      default:
        throw Exception('Unsupported HTTP method: $method');
    }

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Request failed: ${response.statusCode}');
    }
  }

  Future<void> authenticate(String username, String password) async {
    final response = await http.post(
      Uri.parse(
        kDebugMode
            ? 'http://127.0.0.1:8000/users/token'
            : 'https://taste-buddy.uk/users/token',
      ),
      body: {
        'username': username,
        'password': password,
      },
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
      _accessToken = jsonResponse['access_token'];
      await fetchUser();
      notifyListeners();
    } else {
      throw Exception('Failed to authenticate: ${response.statusCode}');
    }
  }

  Future<void> loadToken() async {
    const storage = FlutterSecureStorage();
    final token = await storage.read(key: 'jwt');
    if (token != null) {
      _accessToken = token;
      notifyListeners();
    }
  }

  Future<void> fetchUser() async {
    if (_accessToken.isEmpty) {
      return; // Don't fetch if there's no token
    }
    try {
      final jsonResponse =
          await _sendAuthenticatedRequest('/users/me', method: 'GET', body: {});
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
        await _sendAuthenticatedRequest('/users/me/recipes/remove/',
            method: 'POST', body: {'recipe_id': recipeId}, isFormData: true);
      } else {
        print('Adding recipe $recipeId');
        _user.recipes.add(recipeId);
        await _sendAuthenticatedRequest('/users/me/recipes/add/',
            method: 'POST', body: {'recipe_id': recipeId}, isFormData: true);
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
