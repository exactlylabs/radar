class AppInfoModalState {
  const AppInfoModalState({
    this.warning,
    this.delay = 15,
    this.enableWardrivingMode = false,
  });

  AppInfoModalState copyWith({
    String? warning,
    bool? enableWardrivingMode,
    int? delay,
  }) {
    return AppInfoModalState(
      warning: warning ?? this.warning,
      delay: delay ?? this.delay,
      enableWardrivingMode: enableWardrivingMode ?? this.enableWardrivingMode,
    );
  }

  AppInfoModalState resetWarning() {
    return AppInfoModalState(
      warning: null,
      delay: delay,
      enableWardrivingMode: enableWardrivingMode,
    );
  }

  final String? warning;
  final int? delay;
  final bool enableWardrivingMode;
}
