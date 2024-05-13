import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';

class NavigationCubit extends Cubit<NavigationState> {
  NavigationCubit() : super(NavigationState()) {
    _getConnectionStatuses();
    _listenToConnectivityChanges();
  }

  final Connectivity _connectivity = Connectivity();

  void changeTab(int index) {
    emit(state.copyWith(currentIndex: index));
  }

  void changeTabWithArgs(int index, dynamic args) {
    emit(NavigationState(currentIndex: index, args: args, canNavigate: state.canNavigate));
  }

  Future<void> _getConnectionStatuses() async {
    final statuses = await _connectivity.checkConnectivity();
    _parseConnectionStatuses(statuses);
  }

  void _parseConnectionStatuses(List<ConnectivityResult> statuses) {
    if (statuses.contains(ConnectivityResult.wifi) ||
        statuses.contains(ConnectivityResult.mobile) ||
        statuses.contains(ConnectivityResult.ethernet)) {
      emit(state.copyWith(canNavigate: true));
    } else {
      emit(state.copyWith(canNavigate: false));
    }
  }

  void _listenToConnectivityChanges() {
    _connectivity.onConnectivityChanged.listen((statuses) {
      _parseConnectionStatuses(statuses);
    });
  }

  static const SPEED_TEST_INDEX = 0;
  static const RESULTS_INDEX = 1;
  static const MAP_INDEX = 2;
}
