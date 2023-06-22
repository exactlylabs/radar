import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';

class AppInfoModalState {
  const AppInfoModalState({
    this.delayWarning,
    this.delay = 15,
    this.enableWardrivingMode = false,
    this.locationSettingsShouldBeUpdated = false,
    this.configWarnings,
  });

  AppInfoModalState copyWith({
    String? delayWarning,
    bool? enableWardrivingMode,
    int? delay,
    bool? locationSettingsShouldBeUpdated,
    List<WarningViewModel>? configWarnings,
  }) {
    return AppInfoModalState(
      delayWarning: delayWarning ?? this.delayWarning,
      delay: delay ?? this.delay,
      locationSettingsShouldBeUpdated:
          locationSettingsShouldBeUpdated ?? this.locationSettingsShouldBeUpdated,
      enableWardrivingMode: enableWardrivingMode ?? this.enableWardrivingMode,
      configWarnings: configWarnings ?? this.configWarnings,
    );
  }

  AppInfoModalState resetDelayWarning() {
    return AppInfoModalState(
      delayWarning: null,
      delay: delay,
      locationSettingsShouldBeUpdated: locationSettingsShouldBeUpdated,
      enableWardrivingMode: enableWardrivingMode,
      configWarnings: configWarnings,
    );
  }

  final String? delayWarning;
  final int? delay;
  final bool locationSettingsShouldBeUpdated;
  final bool enableWardrivingMode;
  final List<WarningViewModel>? configWarnings;
}
