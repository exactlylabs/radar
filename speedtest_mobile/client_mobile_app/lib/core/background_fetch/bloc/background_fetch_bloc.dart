import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:configuration_monitoring/models/configuration_status.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/background_fetch/background_fetch_handler.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_state.dart';

class BackgroundFetchBloc extends Cubit<BackgroundFetchState> {
  BackgroundFetchBloc({
    required LocalStorage localStorage,
    required ConfigurationMonitoring configurationMonitoring,
  })  : _localStorage = localStorage,
        _configurationMonitoring = configurationMonitoring,
        super(const BackgroundFetchState()) {
    _listenToConfigurationMonitoring();
    _loadPreferences();
    _loadConfigurationMonitoring();
  }

  final LocalStorage _localStorage;
  final ConfigurationMonitoring _configurationMonitoring;

  late final StreamSubscription<ConfigurationStatus> _configurationMonitoringSubscription;

  Future<void> _loadPreferences() async {
    final backgroundSpeedTestDelay = _localStorage.getBackgroundModeFrequency();
    if (backgroundSpeedTestDelay >= 0) {
      emit(BackgroundFetchState(delay: backgroundSpeedTestDelay, isEnabled: true));
      BackgroundFetchHandler.startBackgroundSpeedTest(backgroundSpeedTestDelay * 60000);
    }
  }

  Future<void> _loadConfigurationMonitoring() async {
    final airplaneMode = await _configurationMonitoring.getAirplaneModeStatus();
    if (airplaneMode.status) {
      disableBackgroundSpeedTest();
    }
  }

  Future<void> enableBackgroundSpeedTest() async {
    if (!state.isAirplaneModeOn && (!state.isEnabled && state.delay >= 0)) {
      emit(BackgroundFetchState(delay: state.delay, isEnabled: true));
      await _localStorage.setBackgroundModeFrequency(state.delay);
      BackgroundFetchHandler.stopBackgroundSpeedTest();
      BackgroundFetchHandler.startBackgroundSpeedTest(state.delay * 60000);
    }
  }

  Future<void> disableBackgroundSpeedTest() async {
    if (state.isEnabled) {
      emit(
          BackgroundFetchState(delay: state.isAirplaneModeOn ? state.delay : -1, isEnabled: false));
      await _localStorage.setBackgroundModeFrequency(-1);
      BackgroundFetchHandler.stopBackgroundSpeedTest();
    }
  }

  void _listenToConfigurationMonitoring() {
    _configurationMonitoringSubscription = _configurationMonitoring.listener.listen(
      (event) {
        if (event.name == AIRPLANE_MODE_EVENT) {
          emit(state.copyWith(isAirplaneModeOn: event.status));
          event.status ? disableBackgroundSpeedTest() : enableBackgroundSpeedTest();
        }
      },
    );
  }

  void setDelay(int delay) => emit(BackgroundFetchState(delay: delay, isEnabled: state.isEnabled));

  @override
  Future<void> close() {
    _configurationMonitoringSubscription.cancel();
    return super.close();
  }

  static const String AIRPLANE_MODE_EVENT = 'AIRPLANE_MODE';
}
