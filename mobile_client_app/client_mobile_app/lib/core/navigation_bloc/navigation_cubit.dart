import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class NavigationCubit extends Cubit<NavigationState> {
  NavigationCubit() : super(NavigationState());

  void changeTab(int index) {
    emit(NavigationState(currentIndex: index));
  }

  void changeTabWithArgs(int index, dynamic args) {
    emit(NavigationState(currentIndex: index, args: args));
  }

  static const SPEED_TEST_INDEX = 0;
  static const RESULTS_INDEX = 1;
  static const MAP_INDEX = 2;
}
