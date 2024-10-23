import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:network_connection_info/models/connection_info.dart';

import 'network_connection_info_platform_interface.dart';

/// An implementation of [NetworkConnectionInfoPlatform] that uses method channels.
class MethodChannelNetworkConnectionInfo extends NetworkConnectionInfoPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('network_connection_info');

  @override
  Future<ConnectionInfo?> getNetworkConnectionInfo() async {
    final networkConnectionInfo =
        await methodChannel.invokeMethod<String>('getNetworkConnectionInfo');
    if (networkConnectionInfo != null) {
      final jsonResponse = jsonDecode(networkConnectionInfo) as Map<String, dynamic>?;
      return jsonResponse != null ? ConnectionInfo.fromJson(jsonResponse) : null;
    } else {
      return null;
    }
  }

  @override
  Future<ConnectionInfo?> getCellularNetworkConnectionInfo() async {
    final networkConnectionInfo =
        await methodChannel.invokeMethod<String>('getCellularNetworkConnectionInfo');
    if (networkConnectionInfo != null) {
      final jsonResponse = jsonDecode(networkConnectionInfo) as Map<String, dynamic>?;
      return jsonResponse != null ? ConnectionInfo.fromJson(jsonResponse) : null;
    } else {
      return null;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getWifiNetworkList() async {
    final wifiNetworkList = await methodChannel.invokeMethod<List<dynamic>>('getWifiNetworkList');
    if (wifiNetworkList != null) {
      final response =
          wifiNetworkList.map<Map<String, dynamic>>((e) => e.cast<String, dynamic>()).toList();
      return response;
    } else {
      return [];
    }
  }
}
