import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';

class AppInfoModalState {
  const AppInfoModalState({
    required this.isEnabled,
    required this.isBackgroundModeEnabled,
    this.delay = 15,
    this.delayWarning,
    this.configWarnings,
    this.setDelay = false,
    this.isGeolocationEnabled,
    this.updateGeolocationToAlways,
  });

  AppInfoModalState copyWith({
    int? delay,
    bool? setDelay,
    bool? isEnabled,
    bool? showWarnings,
    String? delayWarning,
    bool? isGeolocationEnabled,
    bool? isBackgroundModeEnabled,
    bool? updateGeolocationToAlways,
    List<WarningViewModel>? configWarnings,
  }) {
    return AppInfoModalState(
      delay: delay ?? this.delay,
      setDelay: setDelay ?? this.setDelay,
      isEnabled: isEnabled ?? this.isEnabled,
      delayWarning: delayWarning ?? this.delayWarning,
      configWarnings: configWarnings ?? this.configWarnings,
      isGeolocationEnabled: isGeolocationEnabled ?? this.isGeolocationEnabled,
      isBackgroundModeEnabled: isBackgroundModeEnabled ?? this.isBackgroundModeEnabled,
      updateGeolocationToAlways: updateGeolocationToAlways ?? this.updateGeolocationToAlways,
    );
  }

  AppInfoModalState resetDelayWarning() {
    return AppInfoModalState(
      delay: delay,
      delayWarning: null,
      setDelay: setDelay,
      isEnabled: isEnabled,
      configWarnings: configWarnings,
      isGeolocationEnabled: isGeolocationEnabled,
      isBackgroundModeEnabled: isBackgroundModeEnabled,
      updateGeolocationToAlways: updateGeolocationToAlways,
    );
  }

  final int? delay;
  final bool setDelay;
  final bool isEnabled;
  final String? delayWarning;
  final bool? isGeolocationEnabled;
  final bool isBackgroundModeEnabled;
  final bool? updateGeolocationToAlways;
  final List<WarningViewModel>? configWarnings;
}
