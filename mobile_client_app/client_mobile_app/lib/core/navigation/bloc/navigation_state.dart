import 'package:client_mobile_app/core/navigation/bloc/models/navigation_route.dart';

class NavigationState {
  const NavigationState({
    this.routes = const [],
  });
  final List<NavigationRoute> routes;
}
