import 'dart:io';
import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:configuration_monitoring/models/configuration_status.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/notifications/flutter_notifications.dart';
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
      emit(state.copyWith(delay: backgroundSpeedTestDelay, isEnabled: true));
      BackgroundFetchHandler.startBackgroundSpeedTest(backgroundSpeedTestDelay * 60000);
    }
  }

  Future<void> _loadConfigurationMonitoring() async {
    if (!Platform.isAndroid) return;
    final airplaneMode = await _configurationMonitoring.getAirplaneModeStatus();
    if (airplaneMode.status) {
      emit(state.copyWith(isAirplaneModeOn: true));
      disableBackgroundSpeedTest();
    }
  }

  Future<void> enableBackgroundSpeedTest() async {
    if (!(state.isAirplaneModeOn || state.isEnabled)) {
      emit(state.copyWith(isEnabled: true));
      await _localStorage.setBackgroundModeFrequency(state.delay);
      BackgroundFetchHandler.stopBackgroundSpeedTest();
      BackgroundFetchHandler.startBackgroundSpeedTest(state.delay * 60000);
      showLocalFlutterNotification(
          0, 'Background mode enabled', 'Speed tests will be running in the background.');
    }
  }

  Future<void> disableBackgroundSpeedTest() async {
    if (state.isEnabled) {
      final delay = state.isAirplaneModeOn ? state.delay : -1;
      emit(state.copyWith(delay: delay, isEnabled: false));
      await _localStorage.setBackgroundModeFrequency(-1);
      BackgroundFetchHandler.stopBackgroundSpeedTest();
      await cancelLocalFlutterNotification(0);
    } else {
      emit(state.copyWith(delay: -1));
    }
  }

  void _listenToConfigurationMonitoring() {
    if (!Platform.isAndroid) return;
    _configurationMonitoringSubscription = _configurationMonitoring.listener.listen(
      (event) {
        if (event.name == AIRPLANE_MODE_EVENT) {
          emit(state.copyWith(isAirplaneModeOn: event.status));
          if (event.status) {
            disableBackgroundSpeedTest();
          } else if (!state.isEnabled && state.delay >= 0) {
            enableBackgroundSpeedTest();
          }
        }
      },
    );
  }

  void setDelay(int delay) => emit(state.copyWith(delay: delay));

  @override
  Future<void> close() {
    if (Platform.isAndroid) {
      _configurationMonitoringSubscription.cancel();
    }
    return super.close();
  }

  static const String AIRPLANE_MODE_EVENT = 'AIRPLANE_MODE';
}
