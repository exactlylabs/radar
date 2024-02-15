class WifiTrackerState {
  const WifiTrackerState({
    this.isEnabled = false,
    this.frequency = 3,
  });

  WifiTrackerState copyWith({
    bool? isEnabled,
    int? frequency,
  }) {
    return WifiTrackerState(
      isEnabled: isEnabled ?? this.isEnabled,
      frequency: frequency ?? this.frequency,
    );
  }

  final bool isEnabled;
  final int frequency;
}
