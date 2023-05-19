class ConnectionInfo {
  ConnectionInfo({
    required this.platform,
    required this.connectionType,
    required this.data,
    required this.rssi,
  });

  factory ConnectionInfo.fromJson(Map<String, dynamic> json) {
    return ConnectionInfo(
      platform: json['platform'] as String,
      connectionType: json['connectionType'] as String,
      data: json['connectionInfo'] as Map<String, dynamic>,
      rssi: _getAndroidRSSI(json['connectionInfo'], json['connectionType'] == 'WIFI'),
    );
  }
  static int _getAndroidRSSI(Map<String, dynamic> json, bool isWifi) {
    if (isWifi) {
      if (json['rssi'] == null) return -1;
      return json['rssi'] as int;
    } else {
      if (json['signalStrength'] == null || json['signalStrength']['dbm'] == null) return -1;
      return json['signalStrength']['dbm'];
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'platform': platform,
      'connectionType': connectionType,
      'connectionInfo': data,
      'rssi': rssi,
    };
  }

  final int rssi;
  final String platform;
  final String connectionType;
  final Map<String, dynamic> data;
}
