class User {
  String username;
  bool disabled;
  bool payingCustomer;
  bool isStudent;
  List<String> friends;
  List<String> recipes;

  User(
      {this.username = '',
      this.disabled = false,
      this.payingCustomer = false,
      this.isStudent = false,
      this.friends = const [],
      this.recipes = const []});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      username: json['username'],
      disabled: json['disabled'] ?? false,
      payingCustomer: json['payingCustomer'] ?? false,
      isStudent: json['isStudent'] ?? false,
      friends: json['friends'] != null
          ? List<String>.from(json['friends'])
          : [],
      recipes: json['recipes'] != null
          ? List<String>.from(json['recipes'])
          : [],
    );
  }
}
