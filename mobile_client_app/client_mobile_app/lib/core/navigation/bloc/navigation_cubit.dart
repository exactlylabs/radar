import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/navigation/bloc/models/navigation_route.dart';
import 'package:client_mobile_app/core/navigation/bloc/navigation_state.dart';

class NavigationCubit extends Cubit<NavigationState> {
  NavigationCubit({
    required NavigationRoute baseRoute,
  })  : _baseRoute = baseRoute,
        super(NavigationState(routes: [baseRoute]));

  final NavigationRoute _baseRoute;

  void restartNavigation() => emit(NavigationState(routes: [_baseRoute]));

  void navigateTo(NavigationRoute route) => emit(NavigationState(routes: [...state.routes, route]));

  void navigateToPreviousPage() {
    if (state.routes.length > 1) {
      emit(NavigationState(routes: state.routes.sublist(0, state.routes.length - 1)));
    }
  }

  void navigateBackTo(NavigationRoute route) {
    if (!state.routes.contains(route)) {
      return;
    }
    emit(NavigationState(routes: state.routes.sublist(0, state.routes.indexOf(route) + 1)));
  }

  void navigateBackToAndPush(NavigationRoute route, NavigationRoute newRoute) {
    if (!state.routes.contains(route)) {
      return;
    }
    emit(NavigationState(routes: state.routes.sublist(0, state.routes.indexOf(route) + 1)..add(newRoute)));
  }
}
