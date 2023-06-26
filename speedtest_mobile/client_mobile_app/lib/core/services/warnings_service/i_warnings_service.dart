import 'package:client_mobile_app/core/models/warning.dart';

abstract class IWarningsService {
  Stream<List<Warning>> get warnings;

  Future<void> getWarnings();

  static const String gpsProviderWarningName = 'GPS_PROVIDER_MODE';
  static const String powerModeSaveWarningName = 'POWER_SAVE_MODE';
  static const String airplaneModeWarningName = 'AIRPLANE_MODE';
  static const String batteryUsageUnrestrictedWarningName = 'BATTERY_USAGE_UNRESTRICTED';
}
