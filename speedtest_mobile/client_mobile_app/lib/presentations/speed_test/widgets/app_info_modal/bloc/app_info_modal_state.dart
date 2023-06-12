class AppInfoModalState {
  const AppInfoModalState({
    this.warning,
    this.delay = 15,
    this.enableWardrivingMode = false,
    this.locationSettingsShouldBeUpdated = false,
  });

  AppInfoModalState copyWith({
    String? warning,
    bool? enableWardrivingMode,
    int? delay,
    bool? locationSettingsShouldBeUpdated,
  }) {
    return AppInfoModalState(
      warning: warning ?? this.warning,
      delay: delay ?? this.delay,
      locationSettingsShouldBeUpdated:
          locationSettingsShouldBeUpdated ?? this.locationSettingsShouldBeUpdated,
      enableWardrivingMode: enableWardrivingMode ?? this.enableWardrivingMode,
    );
  }

  AppInfoModalState resetWarning() {
    return AppInfoModalState(
      warning: null,
      delay: delay,
      locationSettingsShouldBeUpdated: locationSettingsShouldBeUpdated,
      enableWardrivingMode: enableWardrivingMode,
    );
  }

  final String? warning;
  final int? delay;
  final bool locationSettingsShouldBeUpdated;
  final bool enableWardrivingMode;
}
