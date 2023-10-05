import 'package:flutter/material.dart';
import 'package:app_settings/app_settings.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/warning.dart';
import 'package:client_mobile_app/core/services/warnings_service/i_warnings_service.dart';

class WarningViewModel {
  WarningViewModel({
    required this.title,
    required this.description,
    required this.priority,
    this.isOptional = true,
    this.onPressed,
  });

  factory WarningViewModel.fromWarning(Warning warning) {
    return WarningViewModel(
      priority: _getPriority(warning.name),
      isOptional: _getOptional(warning.name),
      title: warning.name,
      description: warning.description,
      onPressed: _callbackByName(warning.name),
    );
  }

  factory WarningViewModel.locationPermissionWarning() {
    return WarningViewModel(
      isOptional: false,
      title: IWarningsService.locationPermissionWarningName,
      description: Strings.locationPermissionWarningDescription,
      priority: _getPriority(IWarningsService.locationPermissionWarningName),
      onPressed: _callbackByName(IWarningsService.locationPermissionWarningName),
    );
  }

  factory WarningViewModel.phoneStatePermissionWarning() {
    return WarningViewModel(
      isOptional: true,
      title: IWarningsService.phoneStatePermissionWarningName,
      description: Strings.phoneStatePermissionWarningDescription,
      priority: _getPriority(IWarningsService.phoneStatePermissionWarningName),
      onPressed: _callbackByName(IWarningsService.phoneStatePermissionWarningName),
    );
  }

  factory WarningViewModel.notificationPermissionWarning() {
    return WarningViewModel(
      isOptional: true,
      title: IWarningsService.notificationPermissionWarningName,
      description: Strings.notificationPermissionWarningDescription,
      priority: _getPriority(IWarningsService.notificationPermissionWarningName),
      onPressed: _callbackByName(IWarningsService.notificationPermissionWarningName),
    );
  }

  static int _getPriority(String name) {
    switch (name) {
      case IWarningsService.locationPermissionWarningName:
        return 0;
      case IWarningsService.airplaneModeWarningName:
        return 1;
      case IWarningsService.batteryUsageUnrestrictedWarningName:
        return 2;
      case IWarningsService.phoneStatePermissionWarningName:
        return 3;
      case IWarningsService.notificationPermissionWarningName:
        return 4;
      case IWarningsService.powerModeSaveWarningName:
        return 5;
      case IWarningsService.gpsProviderWarningName:
        return 6;
      default:
        return 7;
    }
  }

  static bool _getOptional(String name) {
    return !(name == IWarningsService.locationPermissionWarningName ||
        name == IWarningsService.airplaneModeWarningName);
  }

  static VoidCallback? _callbackByName(String name) {
    switch (name) {
      case IWarningsService.gpsProviderWarningName:
        return () => AppSettings.openAppSettings(type: AppSettingsType.location);
      case IWarningsService.locationPermissionWarningName:
        return () => AppSettings.openAppSettings();
      case IWarningsService.airplaneModeWarningName:
        return () => AppSettings.openAppSettings(type: AppSettingsType.wireless);
      case IWarningsService.powerModeSaveWarningName:
        return () => AppSettings.openAppSettings(type: AppSettingsType.batteryOptimization);
      case IWarningsService.batteryUsageUnrestrictedWarningName:
        return () => AppSettings.openAppSettings();
      case IWarningsService.phoneStatePermissionWarningName:
        return () => AppSettings.openAppSettings();
      case IWarningsService.notificationPermissionWarningName:
        return () => AppSettings.openAppSettings();
      default:
        return () => AppSettings.openAppSettings();
    }
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is WarningViewModel &&
          runtimeType == other.runtimeType &&
          isOptional == other.isOptional &&
          title == other.title &&
          description == other.description &&
          priority == other.priority;

  @override
  int get hashCode =>
      isOptional.hashCode ^ title.hashCode ^ description.hashCode ^ priority.hashCode;

  final bool isOptional;
  final String title;
  final String description;
  final VoidCallback? onPressed;
  final int priority;
}
