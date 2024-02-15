import 'dart:async';

import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/wifi_tracking/bloc/wifi_tracker_state.dart';
import 'package:client_mobile_app/core/wifi_tracking/wifi_tracker_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class WifiTrackerCubit extends Cubit<WifiTrackerState> {
  WifiTrackerCubit({
    required LocalStorage localStorage,
  })  : _localStorage = localStorage,
        super(const WifiTrackerState()) {
    _loadPreferences();
  }

  final LocalStorage _localStorage;

  Future<void> _loadPreferences() async {
    final wifiTrackerFrequency = _localStorage.getWifiTrackerFrequency();
    if (wifiTrackerFrequency >= 0) {
      final started = await WifiTrackerService.setupAndStart(wifiTrackerFrequency * 1000);
      if (!started) {
        disableWifiTracker();
      }
    }
  }

  Future<void> enableWifiTracker() async {
    if (!state.isEnabled) {
      final started = await WifiTrackerService.setupAndStart(state.frequency * 1000);
      if (started) {
        emit(state.copyWith(isEnabled: true));
        await _localStorage.setWifiTrackerFrequency(state.frequency);
      }
    }
  }

  Future<void> disableWifiTracker() async {
    if (state.isEnabled) {
      final stopped = await WifiTrackerService.stop();
      if (stopped) {
        emit(state.copyWith(isEnabled: false));
        await _localStorage.setWifiTrackerFrequency(-1);
      }
    } else {
      emit(state.copyWith(frequency: -1));
    }
  }

  void setFrequency(int frequency) => emit(state.copyWith(frequency: frequency));
}
