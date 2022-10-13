import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'ndt7_client_platform_interface.dart';

/// An implementation of [Ndt7ClientPlatform] that uses method channels.
class MethodChannelNdt7Client extends Ndt7ClientPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('ndt7_client');

  @override
  Future<String?> getPlatformVersion() async {
    final version = await methodChannel.invokeMethod<String>('getPlatformVersion');
    return version;
  }
}
