class NavigationRoute {
  const NavigationRoute({
    required this.routeName,
    this.arguments,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is NavigationRoute &&
          runtimeType == other.runtimeType &&
          routeName == other.routeName &&
          arguments == other.arguments;

  @override
  int get hashCode => routeName.hashCode ^ arguments.hashCode;

  final String routeName;
  final Object? arguments;
}
