class WifiTrackerState {
  const WifiTrackerState({
    this.isEnabled = false,
    this.frequency = 3,
    this.permission = const {
      LOCATION_ALWAYS_PERMISSION: false,
      PHONE_PERMISSION: false,
      NOTIFICATION_PERMISSION: false,
    },
    this.permissionsMessage,
  });

  WifiTrackerState copyWith({
    bool? isEnabled,
    int? frequency,
    Map<String, bool>? permission,
    String? permissionsMessage,
  }) {
    return WifiTrackerState(
      isEnabled: isEnabled ?? this.isEnabled,
      frequency: frequency ?? this.frequency,
      permission: permission ?? this.permission,
      permissionsMessage: permissionsMessage ?? this.permissionsMessage,
    );
  }

  final bool isEnabled;
  final int frequency;
  final Map<String, bool> permission;
  final String? permissionsMessage;

  static const LOCATION_ALWAYS_PERMISSION = 'location';
  static const PHONE_PERMISSION = 'phone';
  static const NOTIFICATION_PERMISSION = 'notification';
  static const SCHEDULE_EXACT_ALARM_PERMISSION = 'scheduleExactAlarm';
}
