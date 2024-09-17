import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

Future<dynamic> sendRequest(
  String endpoint, {
  required String method,
  Map<String, dynamic>? body,
  bool isFormData = false,
  String accessToken = '',
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
      response = await http.put(uri, headers: headers, body: jsonEncode(body));
      break;
    case 'DELETE':
      response = await http.delete(uri, headers: headers);
      break;
    default:
      throw Exception('Unsupported HTTP method: $method');
  }

  if (response.statusCode == 200) {
    final jsonResponse = jsonDecode(response.body);
    if (jsonResponse.containsKey('response')) {
      return jsonResponse['response'];
    } else {
      throw const FormatException('Unexpected response format');
    }
  } else {
    throw Exception('Request failed: ${response.statusCode}');
  }
}
