import 'package:network_connection_info/models/connection_info.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'network_connection_info_method_channel.dart';

abstract class NetworkConnectionInfoPlatform extends PlatformInterface {
  /// Constructs a NetworkConnectionInfoPlatform.
  NetworkConnectionInfoPlatform() : super(token: _token);

  static final Object _token = Object();

  static NetworkConnectionInfoPlatform _instance = MethodChannelNetworkConnectionInfo();

  /// The default instance of [NetworkConnectionInfoPlatform] to use.
  ///
  /// Defaults to [MethodChannelNetworkConnectionInfo].
  static NetworkConnectionInfoPlatform get instance => _instance;

  /// Platform-specific implementations should set this with their own
  /// platform-specific class that extends [NetworkConnectionInfoPlatform] when
  /// they register themselves.
  static set instance(NetworkConnectionInfoPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  Future<ConnectionInfo?> getNetworkConnectionInfo() {
    throw UnimplementedError('getNetworkConnectionInfo() has not been implemented.');
  }

  Future<ConnectionInfo?> getCellularNetworkConnectionInfo() {
    throw UnimplementedError('getCellularNetworkConnectionInfo() has not been implemented.');
  }

  Future<List<Map<String, dynamic>>> getWifiNetworkList() {
    throw UnimplementedError('getWifiNetworkList() has not been implemented.');
  }
}
