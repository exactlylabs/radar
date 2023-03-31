import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'models/ndt7_response.dart';
import 'ndt7_client_method_channel.dart';

abstract class Ndt7ClientPlatform extends PlatformInterface {
  /// Constructs a Ndt7ClientPlatform.
  Ndt7ClientPlatform() : super(token: _token);

  static final Object _token = Object();

  static Ndt7ClientPlatform _instance = MethodChannelNdt7Client();

  /// The default instance of [Ndt7ClientPlatform] to use.
  ///
  /// Defaults to [MethodChannelNdt7Client].
  static Ndt7ClientPlatform get instance => _instance;

  /// Platform-specific implementations should set this with their own
  /// platform-specific class that extends [Ndt7ClientPlatform] when
  /// they register themselves.
  static set instance(Ndt7ClientPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  Stream<NDT7Response?> get data {
    throw UnimplementedError('data() has not been implemented.');
  }

  Future<void> startDownloadTest(String dir) {
    throw UnimplementedError('startDownloadTest() has not been implemented.');
  }

  Future<void> startUploadTest() {
    throw UnimplementedError('startUploadTest() has not been implemented.');
  }

  Future<void> stopTest() {
    throw UnimplementedError('stopTest() has not been implemented.');
  }
}
