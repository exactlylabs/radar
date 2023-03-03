import 'package:flutter_test/flutter_test.dart';
import 'package:network_connection_info/models/connection_info.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:network_connection_info/network_connection_info_platform_interface.dart';
import 'package:network_connection_info/network_connection_info_method_channel.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class MockNetworkConnectionInfoPlatform with MockPlatformInterfaceMixin implements NetworkConnectionInfoPlatform {
  @override
  Future<String?> getPlatformVersion() => Future.value('42');

  @override
  Future<ConnectionInfo?> getNetworkConnectionInfo() {
    // TODO: implement getNetworkConnectionInfo
    throw UnimplementedError();
  }
}

void main() {
  final NetworkConnectionInfoPlatform initialPlatform = NetworkConnectionInfoPlatform.instance;

  test('$MethodChannelNetworkConnectionInfo is the default instance', () {
    expect(initialPlatform, isInstanceOf<MethodChannelNetworkConnectionInfo>());
  });

  test('getPlatformVersion', () async {
    NetworkConnectionInfo networkConnectionInfoPlugin = NetworkConnectionInfo();
    MockNetworkConnectionInfoPlatform fakePlatform = MockNetworkConnectionInfoPlatform();
    NetworkConnectionInfoPlatform.instance = fakePlatform;
  });
}
