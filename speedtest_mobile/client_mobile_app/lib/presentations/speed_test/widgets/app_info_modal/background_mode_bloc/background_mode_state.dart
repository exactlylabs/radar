import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';

class BackgroundModeState {
  const BackgroundModeState({
    this.backgroundMode = false,
    this.askForLocationAllTime = false,
    this.askForOptionalPermissions = false,
    this.askForFrequency = false,
    this.frequency,
    this.hasAccessToLocationAllTime,
    this.hasAccessToPhoneState,
    this.hasAccessToNotifications,
    this.warnings,
  });

  BackgroundModeState copyWith({
    bool? backgroundMode,
    bool? hasAccessToLocationAllTime,
    bool? hasAccessToPhoneState,
    bool? hasAccessToNotifications,
    bool? askForLocationAllTime,
    bool? askForOptionalPermissions,
    bool? askForFrequency,
    int? frequency,
    List<WarningViewModel>? warnings,
  }) {
    return BackgroundModeState(
      backgroundMode: backgroundMode ?? this.backgroundMode,
      hasAccessToPhoneState: hasAccessToPhoneState ?? this.hasAccessToPhoneState,
      askForLocationAllTime: askForLocationAllTime ?? this.askForLocationAllTime,
      hasAccessToNotifications: hasAccessToNotifications ?? this.hasAccessToNotifications,
      askForOptionalPermissions: askForOptionalPermissions ?? this.askForOptionalPermissions,
      hasAccessToLocationAllTime: hasAccessToLocationAllTime ?? this.hasAccessToLocationAllTime,
      askForFrequency: askForFrequency ?? this.askForFrequency,
      frequency: frequency ?? this.frequency,
      warnings: warnings ?? this.warnings,
    );
  }

  final bool backgroundMode;
  final bool askForLocationAllTime;
  final bool askForOptionalPermissions;
  final bool? hasAccessToLocationAllTime;
  final bool? hasAccessToPhoneState;
  final bool? hasAccessToNotifications;
  final bool askForFrequency;
  final int? frequency;
  final List<WarningViewModel>? warnings;
}
