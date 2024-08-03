// BaseAPIResponse class
class BaseAPIResponse {
  final bool error;

  BaseAPIResponse({this.error = false});

  factory BaseAPIResponse.fromJson(Map<String, dynamic> json) {
    return BaseAPIResponse(
      error: json['error'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'error': error,
    };
  }
}

// APIResponse class for a single response
class APIResponse<T> extends BaseAPIResponse {
  final T response;

  APIResponse({required super.error, required this.response});

  factory APIResponse.fromJson(Map<String, dynamic> json, T Function(Map<String, dynamic>) create) {
    return APIResponse(
      error: json['error'] ?? false,
      response: create(json['response']),
    );
  }

  @override
  Map<String, dynamic> toJson() {
    return {
      ...super.toJson(),
      'response': response,
    };
  }
}

// APIResponseList class for a list of responses
class APIResponseList<T> extends BaseAPIResponse {
  final List<T> response;

  APIResponseList({required super.error, required this.response});

  factory APIResponseList.fromJson(Map<String, dynamic> json, T Function(Map<String, dynamic>) create) {
    var list = json['response'] as List;
    List<T> items = list.map((item) => create(item)).toList();

    return APIResponseList(
      error: json['error'] ?? false,
      response: items,
    );
  }

  @override
  Map<String, dynamic> toJson() {
    return {
      ...super.toJson(),
      'response': response,
    };
  }
}