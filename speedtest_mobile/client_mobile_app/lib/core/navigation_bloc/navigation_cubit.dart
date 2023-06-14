import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';

class NavigationCubit extends Cubit<NavigationState> {
  NavigationCubit() : super(NavigationState()) {
    _getConnectionStatus();
    _listenToConnectivityChanges();
  }

  final Connectivity _connectivity = Connectivity();

  void changeTab(int index) {
    emit(NavigationState(currentIndex: index));
  }

  void changeTabWithArgs(int index, dynamic args) {
    emit(NavigationState(currentIndex: index, args: args));
  }

  Future<void> _getConnectionStatus() async {
    final status = await _connectivity.checkConnectivity();
    _parseConnectionStatus(status);
  }

  void _parseConnectionStatus(ConnectivityResult status) {
    if (status == ConnectivityResult.wifi ||
        status == ConnectivityResult.mobile ||
        status == ConnectivityResult.ethernet) {
      emit(state.copyWith(canNavigate: true));
    } else {
      emit(state.copyWith(canNavigate: false));
    }
  }

  void _listenToConnectivityChanges() {
    _connectivity.onConnectivityChanged.listen((status) {
      _parseConnectionStatus(status);
    });
  }

  static const SPEED_TEST_INDEX = 0;
  static const RESULTS_INDEX = 1;
  static const MAP_INDEX = 2;
}
