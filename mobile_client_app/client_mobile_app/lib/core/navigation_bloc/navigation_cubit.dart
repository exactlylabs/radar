import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class NavigationCubit extends Cubit<NavigationState> {
  NavigationCubit() : super(NavigationState());

  void changeTab(int index) {
    emit(state.copyWith(currentIndex: index));
  }
}
