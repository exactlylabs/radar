import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/wifi_tracking/wifi_tracker_service.dart';
import 'package:client_mobile_app/core/wifi_tracking/bloc/wifi_tracker_state.dart';

class WifiTrackerCubit extends Cubit<WifiTrackerState> {
  WifiTrackerCubit({
    required LocalStorage localStorage,
  })  : _localStorage = localStorage,
        super(const WifiTrackerState()) {
    _loadPreferences();
  }

  final LocalStorage _localStorage;

  Future<void> _loadPreferences() async {
    final permissions = await checkPermissions();
    if (permissions.values.every((permissionStatus) => permissionStatus)) {
      final wifiTrackerFrequency = _localStorage.getWifiTrackerFrequency() / 1000;
      if (wifiTrackerFrequency >= 0) {
        emit(state.copyWith(
            isEnabled: true, frequency: wifiTrackerFrequency.toInt(), permission: permissions));
        return;
      }
    } else {
      final permissionsNotGranted =
          permissions.entries.where((entry) => !entry.value).map((entry) => entry.key).toList();
      final permissionsMessage = 'Please grant ${permissionsNotGranted.join(', ')} permissions';
      emit(state.copyWith(permission: permissions, permissionsMessage: permissionsMessage));
    }
    disableWifiTracker();
  }

  Future<void> enableWifiTracker() async {
    final permissions = await checkPermissions();
    if (permissions.values.every((permissionStatus) => permissionStatus)) {
      if (!state.isEnabled) {
        final started = await WifiTrackerService.setupAndStart(state.frequency * 1000);
        if (started) {
          emit(state.copyWith(isEnabled: true));
          await _localStorage.setWifiTrackerFrequency(state.frequency * 1000);
        }
      }
    } else {
      final permissionsNotGranted =
          permissions.entries.where((entry) => !entry.value).map((entry) => entry.key).toList();
      final permissionsMessage = 'Please grant ${permissionsNotGranted.join(', ')} permissions';
      emit(state.copyWith(permission: permissions, permissionsMessage: permissionsMessage));
    }
  }

  Future<void> disableWifiTracker() async {
    if (state.isEnabled) {
      final permissions = await checkPermissions();
      final permissionsNotGranted =
          permissions.entries.where((entry) => !entry.value).map((entry) => entry.key).toList();
      String? permissionsMessage;
      if (permissionsNotGranted.isNotEmpty) {
        permissionsMessage = 'Please grant ${permissionsNotGranted.join(', ')} permissions';
      } else {
        permissionsMessage = '';
      }
      final stopped = await WifiTrackerService.stop();
      if (stopped) {
        emit(state.copyWith(
            isEnabled: false,
            frequency: 3,
            permission: permissions,
            permissionsMessage: permissionsMessage));
        await _localStorage.setWifiTrackerFrequency(-1);
      }
    }
  }

  Future<void> updatePermissionsStatus() async {
    final permissions = await checkPermissions();
    final permissionsNotGranted =
        permissions.entries.where((entry) => !entry.value).map((entry) => entry.key).toList();
    if (permissionsNotGranted.isNotEmpty) {
      final permissionsMessage = 'Please grant ${permissionsNotGranted.join(', ')} permissions';
      emit(state.copyWith(permission: permissions, permissionsMessage: permissionsMessage));
    } else {
      emit(state.copyWith(permission: permissions, permissionsMessage: ''));
    }
  }

  Future<Map<String, bool>> checkPermissions() async {
    //Location always
    final permissions = <String, bool>{};
    final locationStatus = await Permission.locationAlways.isGranted;
    permissions[WifiTrackerState.LOCATION_ALWAYS_PERMISSION] = locationStatus;

    //Phone
    final phoneStatus = await Permission.phone.isGranted;
    permissions[WifiTrackerState.PHONE_PERMISSION] = phoneStatus;

    //Notification
    final notificationStatus = await Permission.notification.isGranted;
    permissions[WifiTrackerState.NOTIFICATION_PERMISSION] = notificationStatus;

    return permissions;
  }

  void setFrequency(int frequency) => emit(state.copyWith(frequency: frequency));
}
