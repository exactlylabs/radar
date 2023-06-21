import 'dart:io';

import 'package:geolocator/geolocator.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_state.dart';

class AppInfoModalCubit extends Cubit<AppInfoModalState> {
  AppInfoModalCubit() : super(const AppInfoModalState());

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
}
