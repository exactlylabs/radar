import 'dart:io';
import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:endless_service/endless_service.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:configuration_monitoring/models/configuration_status.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/notifications/flutter_notifications.dart';
import 'package:client_mobile_app/core/background_fetch/background_speed_test.dart';
import 'package:client_mobile_app/core/endless_service/endless_service_handler.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_state.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
// import 'package:client_mobile_app/core/background_fetch/background_fetch_handler.dart';

class BackgroundFetchBloc extends Cubit<BackgroundFetchState> {
  BackgroundFetchBloc({
    required LocalStorage localStorage,
    required ConfigurationMonitoring configurationMonitoring,
    required EndlessService endlessService,
    required RestClient restClient,
    required NetworkConnectionInfo networkConnectionInfo,
    required IHttpProvider httpProvider,
  })  : _localStorage = localStorage,
        _configurationMonitoring = configurationMonitoring,
        _endlessServiceHandler = EndlessServiceHandler(endlessService: endlessService),
        _backgroundSpeedTest = BackgroundSpeedTest(
          restClient: restClient,
          localStorage: localStorage,
          httpProvider: httpProvider,
          networkConnectionInfo: networkConnectionInfo,
        ),
        super(const BackgroundFetchState()) {
    _listenToConfigurationMonitoring();
    _loadPreferences();
    _loadConfigurationMonitoring();
  }

  final LocalStorage _localStorage;
  final ConfigurationMonitoring _configurationMonitoring;
  final EndlessServiceHandler _endlessServiceHandler;
  final BackgroundSpeedTest _backgroundSpeedTest;

  late final StreamSubscription<ConfigurationStatus> _configurationMonitoringSubscription;

  Future<void> _loadPreferences() async {
    final backgroundSpeedTestDelay = _localStorage.getBackgroundModeFrequency();
    if (backgroundSpeedTestDelay >= 0) {
      final hasAccessToLocationAllTime = await Permission.locationAlways.isGranted;
      if (hasAccessToLocationAllTime) {
        emit(state.copyWith(delay: backgroundSpeedTestDelay, isEnabled: true));
        await _endlessServiceHandler.configure(
          frequency: backgroundSpeedTestDelay * 60000,
          onAction: () => onAction(),
          onLog: (log) => onLog(log),
          onFailure: (error) => onFailure(error),
        );
        await _endlessServiceHandler.start();
        // BackgroundFetchHandler.startBackgroundSpeedTest(backgroundSpeedTestDelay * 60000);
      }
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
      // _endlessService.stopEndlessService();
      _endlessServiceHandler.configure(
        frequency: state.delay * 60000,
        onAction: onAction,
        onLog: onLog,
        onFailure: onFailure,
      );
      _endlessServiceHandler.start();
      // BackgroundFetchHandler.stopBackgroundSpeedTest();
      // BackgroundFetchHandler.startBackgroundSpeedTest(state.delay * 60000);
      // showLocalFlutterNotification(
      //     0, Strings.backgroundModeNotificaitonTitle, Strings.backgroundModeNotificaitonSubtitle);
    }
  }

  Future<void> disableBackgroundSpeedTest() async {
    if (state.isEnabled) {
      final delay = state.isAirplaneModeOn ? state.delay : -1;
      emit(state.copyWith(delay: delay, isEnabled: false));
      await _localStorage.setBackgroundModeFrequency(-1);
      _endlessServiceHandler.stop();
      // BackgroundFetchHandler.stopBackgroundSpeedTest();
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

  void onAction() => _backgroundSpeedTest.startSpeedTest();

  void onLog(String log) => print(log);

  void onFailure(String error) => Sentry.captureException(error);

  @override
  Future<void> close() {
    if (Platform.isAndroid) {
      _configurationMonitoringSubscription.cancel();
    }
    _endlessServiceHandler.close();
    return super.close();
  }

  static const String AIRPLANE_MODE_EVENT = 'AIRPLANE_MODE';
}
