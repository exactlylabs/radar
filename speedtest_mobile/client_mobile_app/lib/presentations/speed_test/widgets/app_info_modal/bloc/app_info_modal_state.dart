import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';

class AppInfoModalState {
  const AppInfoModalState({
    required this.isEnabled,
    this.setDelay = false,
    required this.isBackgroundModeEnabled,
    this.delay = 15,
    this.delayWarning,
    this.configWarnings,
    this.locationSettingsShouldBeUpdated = false,
  });

  AppInfoModalState copyWith({
    int? delay,
    bool? isEnabled,
    bool? showWarnings,
    String? delayWarning,
    bool? setDelay,
    bool? isBackgroundModeEnabled,
    bool? locationSettingsShouldBeUpdated,
    List<WarningViewModel>? configWarnings,
  }) {
    return AppInfoModalState(
      delay: delay ?? this.delay,
      setDelay: setDelay ?? this.setDelay,
      isEnabled: isEnabled ?? this.isEnabled,
      delayWarning: delayWarning ?? this.delayWarning,
      configWarnings: configWarnings ?? this.configWarnings,
      locationSettingsShouldBeUpdated:
          locationSettingsShouldBeUpdated ?? this.locationSettingsShouldBeUpdated,
      isBackgroundModeEnabled: isBackgroundModeEnabled ?? this.isBackgroundModeEnabled,
    );
  }

  AppInfoModalState resetDelayWarning() {
    return AppInfoModalState(
      delay: delay,
      delayWarning: null,
      setDelay: setDelay,
      isEnabled: isEnabled,
      configWarnings: configWarnings,
      isBackgroundModeEnabled: isBackgroundModeEnabled,
      locationSettingsShouldBeUpdated: locationSettingsShouldBeUpdated,
    );
  }

  final int? delay;
  final String? delayWarning;
  final bool isEnabled;
  final bool setDelay;
  final bool isBackgroundModeEnabled;
  final bool locationSettingsShouldBeUpdated;
  final List<WarningViewModel>? configWarnings;
}
