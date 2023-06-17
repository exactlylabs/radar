import 'dart:async';
import 'dart:io';

import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:configuration_monitoring/models/configuration_status.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_state.dart';

class AppInfoModalCubit extends Cubit<AppInfoModalState> {
  AppInfoModalCubit({
    required ConfigurationMonitoring configurationMonitoring,
  })  : _configurationMonitoring = configurationMonitoring,
        super(const AppInfoModalState()) {
    _listenToConfigurationMonitoring();
    _loadConfigurationMonitoring();
  }

  final ConfigurationMonitoring _configurationMonitoring;
  late final StreamSubscription<ConfigurationStatus> _configurationMonitoringSubscription;

  Future<void> enableWardrivingMode() async {
    final updateSettings = await shouldUpdateLocationSettings();
    if (updateSettings) {
      emit(state.copyWith(locationSettingsShouldBeUpdated: true));
    } else {
      await shouldRequestPhoneStatePermission();
      emit(state.copyWith(enableWardrivingMode: true, locationSettingsShouldBeUpdated: false));
    }
  }

  void disableWardrivingMode() {
    emit(state.copyWith(enableWardrivingMode: false));
  }

  void cancel() {
    emit(const AppInfoModalState());
  }

  void updateDelay(String delay) {
    final int parsedDelay = int.tryParse(delay) ?? -1;
    emit(state.copyWith(delay: parsedDelay));
  }

  bool validateDelay() {
    final delay = state.delay ?? -1;
    if (Platform.isAndroid) {
      if (delay < 1) {
        emit(state.copyWith(warning: Strings.androidMinimumDelayError));
        return false;
      } else {
        emit(state.resetWarning());
        return true;
      }
    } else {
      if (delay < 15) {
        emit(state.copyWith(warning: Strings.iOSMinimumDelayError));
        return false;
      } else {
        emit(state.resetWarning());
        return true;
      }
    }
  }

  Future<bool> shouldUpdateLocationSettings() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.always) {
      return false;
    } else if (permission == LocationPermission.denied) {
      final permission = await Geolocator.requestPermission();
      return permission != LocationPermission.always;
    }
    return true;
  }

  Future<void> shouldRequestPhoneStatePermission() async {
    final phoneStatePermissionGranted = await Permission.phone.isGranted;
    if (!phoneStatePermissionGranted) {
      await Permission.phone.request();
    }
  }

  Future<void> _loadConfigurationMonitoring() async {
    final config = <String, ConfigurationStatus>{};
    final gpsProvider = await _configurationMonitoring.getGPSProviderStatus();
    if (!gpsProvider.status) config[gpsProvider.name] = gpsProvider;
    final powerModeSave = await _configurationMonitoring.getPowerModeSaveStatus();
    if (powerModeSave.status) config[powerModeSave.name] = powerModeSave;
    final airplaneMode = await _configurationMonitoring.getAirplaneModeStatus();
    if (airplaneMode.status) {
      config[airplaneMode.name] = airplaneMode;
      disableBackgroundNetworkConnectionInfo();
    }
    if (config.isNotEmpty) emit(state.copyWith(configuration: config));
  }

  void _listenToConfigurationMonitoring() {
    _configurationMonitoringSubscription = _configurationMonitoring.listener.listen(
      (event) {
        final isWarning = ((event.name == GPS_PROVIDER_MODE_EVENT && !event.status) ||
            (event.name == POWER_SAVE_MODE_EVENT && event.status) ||
            (event.name == AIRPLANE_MODE_EVENT && event.status));
        if (state.configuration == null && isWarning) {
          emit(state.copyWith(configuration: {event.name: event}));
        } else {
          Map<String, ConfigurationStatus> configuration =
              (state.configuration ?? <String, ConfigurationStatus>{});
          if (!isWarning && configuration.containsKey(event.name)) {
            configuration.remove(event.name);
          } else {
            configuration[event.name] = event;
          }
          emit(state.copyWith(configuration: configuration));
        }
        if (event.name == AIRPLANE_MODE_EVENT) {
          event.status
              ? disableBackgroundNetworkConnectionInfo()
              : enableBackgroundNetworkConnectionInfo();
        }
      },
    );
  }
}
