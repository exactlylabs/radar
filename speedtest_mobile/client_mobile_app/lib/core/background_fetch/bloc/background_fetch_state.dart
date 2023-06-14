class BackgroundFetchState {
  const BackgroundFetchState({
    this.delay = -1,
    this.isEnabled = false,
    this.isAirplaneModeOn = false,
  });

  BackgroundFetchState copyWith({
    int? delay,
    bool? isEnabled,
    bool? isAirplaneModeOn,
  }) {
    return BackgroundFetchState(
      delay: delay ?? this.delay,
      isEnabled: isEnabled ?? this.isEnabled,
      isAirplaneModeOn: isAirplaneModeOn ?? this.isAirplaneModeOn,
    );
  }

  final int delay;
  final bool isEnabled;
  final bool isAirplaneModeOn;
}
