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
  })  : _warningsService = warningsService,
        super(const AppInfoModalState()) {
    _listenToWarnings();
  }

  final IWarningsService _warningsService;
  late StreamSubscription<List<Warning>>? _warningsSubscription;

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
      default:
        return () => AppSettings.openAppSettings();
    }
  }
}
