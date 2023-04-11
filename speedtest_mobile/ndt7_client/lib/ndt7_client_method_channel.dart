import 'dart:async';
import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import 'package:ndt7_client/models/client_response.dart';
import 'package:ndt7_client/models/server_response.dart';
import 'package:ndt7_client/models/test_completed_event.dart';
import 'ndt7_client_platform_interface.dart';
import 'package:ndt7_client/models/ndt7_response.dart';

/// An implementation of [Ndt7ClientPlatform] that uses method channels.
class MethodChannelNdt7Client extends Ndt7ClientPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('method_ndt7_client');

  /// The event channel used to receive events from the native platform.
  @visibleForTesting
  final eventChannel = const EventChannel('event_ndt7_client');

  Stream<dynamic> ndt7Result = const Stream.empty();

  @override
  Stream<NDT7Response?> get data {
    ndt7Result = eventChannel.receiveBroadcastStream();
    return ndt7Result.map((dynamic event) {
      final jsonResponse = jsonDecode(event) as Map<String, dynamic>;
      if (jsonResponse.length == 1 && jsonResponse.containsKey('test')) {
        return TestCompletedEvent.fromJson(jsonResponse);
      } else if (jsonResponse.containsKey('TCPInfo')) {
        return ServerResponse.fromJson(jsonResponse);
      } else {
        return ClientResponse.fromJson(jsonResponse);
      }
    });
  }

  @override
  Future<void> startDownloadTest() async {
    ndt7Result = eventChannel.receiveBroadcastStream();
    await methodChannel.invokeMethod('startDownloadTest');
  }

  @override
  Future<void> startUploadTest() async {
    ndt7Result = eventChannel.receiveBroadcastStream();
    await methodChannel.invokeMethod('startUploadTest');
  }

  @override
  Future<void> stopTest() async {
    await methodChannel.invokeMethod('stopTest');
  }
}
