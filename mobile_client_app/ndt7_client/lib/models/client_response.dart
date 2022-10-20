import 'dart:ffi';

import 'package:ndt7_client/models/ndt7_response.dart';

class ClientResponse implements NDT7Response {
  const ClientResponse(
    this.appInfo,
    this.origin,
    this.test,
  );

  Map<String, dynamic> toJson() => {
        'AppInfo': appInfo.toJson(),
        'Origin': origin,
        'Test': test,
      };

  factory ClientResponse.fromJson(Map<String, dynamic> json) => ClientResponse(
        AppInfo.fromJson(json['AppInfo'] as Map<String, dynamic>),
        json['Origin'] as String,
        json['Test'] as String,
      );

  @override
  String toString() => 'ClientResponse: ${toJson()}';

  final AppInfo appInfo;
  final String origin;
  final String test;
}

class AppInfo {
  AppInfo(
    this.elapsedTime,
    this.numBytes,
  );

  Map<String, dynamic> toJson() => {
        'ElapsedTime': elapsedTime,
        'NumBytes': numBytes,
      };

  factory AppInfo.fromJson(Map<String, dynamic> json) => AppInfo(
        json['ElapsedTime'] as int,
        json['NumBytes'] as int,
      );

  final int elapsedTime;
  final int numBytes;
}
