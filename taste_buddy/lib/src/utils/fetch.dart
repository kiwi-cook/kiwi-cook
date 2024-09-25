import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

Future<dynamic> sendRequest(
  String endpoint, {
  required String method,
  Map<String, dynamic>? body,
  bool isFormData = false,
  String accessToken = '',
  Duration timeout = const Duration(seconds: 30),
}) async {
  const baseUrl =
      kDebugMode ? 'http://127.0.0.1:8000' : 'https://taste-buddy.uk';
  final uri = Uri.parse('$baseUrl$endpoint');
  final headers = <String, String>{};

  if (accessToken.isNotEmpty) {
    headers['Authorization'] = 'Bearer $accessToken';
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  http.Response response;
  try {
    switch (method.toUpperCase()) {
      case 'GET':
        response = await http.get(uri, headers: headers).timeout(timeout);
        break;
      case 'POST':
        if (isFormData) {
          response = await http
              .post(uri, headers: headers, body: body)
              .timeout(timeout);
        } else {
          response = await http
              .post(uri, headers: headers, body: jsonEncode(body))
              .timeout(timeout);
        }
        break;
      case 'PUT':
        response = await http
            .put(uri, headers: headers, body: jsonEncode(body))
            .timeout(timeout);
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers).timeout(timeout);
        break;
      default:
        throw Exception('Unsupported HTTP method: $method');
    }

    return _handleResponse(response);
  } on TimeoutException {
    throw TimeoutException(
        'Request timed out after ${timeout.inSeconds} seconds');
  } on http.ClientException catch (e) {
    throw Exception('Network error: ${e.message}');
  }
}

dynamic _handleResponse(http.Response response) {
  if (response.statusCode >= 200 && response.statusCode < 300 ||
      response.statusCode == 307) {
    try {
      final jsonResponse = jsonDecode(response.body);
      if (jsonResponse.containsKey('response')) {
        return jsonResponse['response'];
      } else {
        throw jsonResponse;
      }
    } on FormatException {
      throw FormatException('Failed to parse JSON: ${response.body}');
    }
  } else {
    throw http.ClientException(
        'Request failed: ${response.statusCode}\n${response.body}');
  }
}
