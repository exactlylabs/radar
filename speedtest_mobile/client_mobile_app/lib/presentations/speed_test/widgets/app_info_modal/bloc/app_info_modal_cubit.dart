import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:app_settings/app_settings.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/warning.dart';
import 'package:client_mobile_app/core/services/warnings_service/i_warnings_service.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';

class AppInfoModalCubit extends Cubit<AppInfoModalState> {
  AppInfoModalCubit({
    required IWarningsService warningsService,
    required bool isBackgroundModeEnabled,
  })  : _warningsService = warningsService,
        super(AppInfoModalState(
          isBackgroundModeEnabled: isBackgroundModeEnabled,
          isEnabled: isBackgroundModeEnabled,
        )) {
    _listenToWarnings();
    _loadWarnings();
  }

  final IWarningsService _warningsService;
  late StreamSubscription<List<Warning>>? _warningsSubscription;

  Future<void> enableWardrivingMode() async {
    final updateSettings = await shouldUpdateLocationSettings();
    if (updateSettings) {
      emit(state.copyWith(updateGeolocationToAlways: true));
    } else {
      await shouldRequestPhoneStatePermission();
      emit(state.copyWith(updateGeolocationToAlways: false, setDelay: true));
    }
  }

  void setWardrivingModeEnabled() {
    emit(state.copyWith(isEnabled: true, showWarnings: true));
  }

  void disableWardrivingMode() {
    emit(state.copyWith(isEnabled: false, showWarnings: false, setDelay: false));
  }

  void cancel() {
    emit(AppInfoModalState(
      isBackgroundModeEnabled: state.isBackgroundModeEnabled,
      isEnabled: state.isBackgroundModeEnabled,
    ));
  }

  void updateDelay(String delay) {
    final int parsedDelay = int.tryParse(delay) ?? -1;
    emit(state.copyWith(delay: parsedDelay));
  }

  bool validateDelay() {
    final delay = state.delay ?? -1;
    if (Platform.isAndroid) {
      if (delay < 1) {
        emit(state.copyWith(delayWarning: Strings.androidMinimumDelayError));
        return false;
      } else {
        emit(state.resetDelayWarning());
        return true;
      }
    } else {
      if (delay < 15) {
        emit(state.copyWith(delayWarning: Strings.iOSMinimumDelayError));
        return false;
      } else {
        emit(state.resetDelayWarning());
        return true;
      }
    }
  }

  void manageLocationAlways() {
    if ((state.isGeolocationEnabled ?? false) && (!(state.updateGeolocationToAlways ?? false))) {
      emit(state.copyWith(updateGeolocationToAlways: true));
    }
  }

  Future<void> manageLocationPermission() async {
    final permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.always) {
      return false;
    } else if (permission == LocationPermission.denied) {
      final permission = await Geolocator.requestPermission();
      return permission != LocationPermission.always;
    }
    return true;
  }

  Future<bool?> isGeolocationEnabled() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.deniedForever) {
      return false;
    } else if (permission == LocationPermission.denied) {
      return null;
    }
    return true;
  }

  Future<void> shouldRequestPhoneStatePermission() async {
    final phoneStatePermissionGranted = await Permission.phone.isGranted;
    if (!phoneStatePermissionGranted) {
      await Permission.phone.request();
    }
  }

  void updateBackgroundMode(bool isEnabled) {
    emit(state.copyWith(isBackgroundModeEnabled: isEnabled));
  }

  Future<void> _loadWarnings() async {
    await _warningsService.getWarnings();
  }

  void _listenToWarnings() {
    _warningsSubscription = _warningsService.warnings.listen(
      (event) {
        final parsedWarnings = event.map((warning) => _parseWarningToViewModel(warning)).toList();
        emit(state.copyWith(configWarnings: parsedWarnings));
      },
    );
  }

  @override
  Future<void> close() {
    _warningsSubscription?.cancel();
    return super.close();
  }

  WarningViewModel _parseWarningToViewModel(Warning warning) {
    return WarningViewModel(
      title: warning.name,
      description: warning.description,
      onPressed: _openSettingsByName(warning.name),
    );
  }

  VoidCallback? _openSettingsByName(String name) {
    switch (name) {
      case IWarningsService.gpsProviderWarningName:
        return () => AppSettings.openLocationSettings();
      case IWarningsService.airplaneModeWarningName:
        return () => AppSettings.openDeviceSettings();
      case IWarningsService.powerModeSaveWarningName:
        return () => AppSettings.openBatteryOptimizationSettings();
      case IWarningsService.batteryUsageUnrestrictedWarningName:
        return () => AppSettings.openAppSettings();
      default:
        return () => AppSettings.openAppSettings();
    }
  }
}
