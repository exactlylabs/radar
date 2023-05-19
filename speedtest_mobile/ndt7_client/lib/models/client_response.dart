import 'package:ndt7_client/models/ndt7_response.dart';

class ClientResponse implements NDT7Response {
  const ClientResponse(
    this.appInfo,
    this.origin,
    this.test,
  );

  factory ClientResponse.fromJson(Map<String, dynamic> json) => ClientResponse(
        AppInfo.fromJson(json['AppInfo'] as Map<String, dynamic>),
        json['Origin'] as String,
        json['Test'] as String,
      );

  final AppInfo appInfo;
  final String origin;
  final String test;
}

class AppInfo {
  AppInfo(
    this.elapsedTime,
    this.numBytes,
    this.meanClientMbps,
  );

  Map<String, dynamic> toJson() => {
        'ElapsedTime': elapsedTime,
        'NumBytes': numBytes,
        'MeanClientMbps': meanClientMbps,
      };

  factory AppInfo.fromJson(Map<String, dynamic> json) => AppInfo(
        json['ElapsedTime'] as int,
        json['NumBytes'] as int,
        _meanMbps(json['ElapsedTime'] as int, json['NumBytes'] as int),
      );

  static double _meanMbps(int elapsedTime, int numBytes) {
    final time = elapsedTime / 1e6;
    double speed = numBytes / time;
    speed *= 8;
    speed /= 1e6;
    return speed;
  }

  final int elapsedTime;
  final int numBytes;
  final double meanClientMbps;
}
