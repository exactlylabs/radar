import 'package:flutter_test/flutter_test.dart';
import 'package:ndt7_client/models/ndt7_response.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:ndt7_client/ndt7_client_platform_interface.dart';
import 'package:ndt7_client/ndt7_client_method_channel.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class MockNdt7ClientPlatform with MockPlatformInterfaceMixin implements Ndt7ClientPlatform {
  @override
  Future<void> startDownloadTest() {
    // TODO: implement startDownloadTest
    throw UnimplementedError();
  }

  @override
  Future<void> startUploadTest() {
    // TODO: implement startUploadTest
    throw UnimplementedError();
  }

  @override
  Future<void> stopTest() {
    // TODO: implement stopTest
    throw UnimplementedError();
  }

  @override
  // TODO: implement data
  Stream<NDT7Response> get data => throw UnimplementedError();
}

void main() {
  final Ndt7ClientPlatform initialPlatform = Ndt7ClientPlatform.instance;

  test('$MethodChannelNdt7Client is the default instance', () {
    expect(initialPlatform, isInstanceOf<MethodChannelNdt7Client>());
  });

  // test('getPlatformVersion', () async {
  //   Ndt7Client ndt7ClientPlugin = Ndt7Client();
  //   MockNdt7ClientPlatform fakePlatform = MockNdt7ClientPlatform();
  //   Ndt7ClientPlatform.instance = fakePlatform;

  //   expect(await ndt7ClientPlugin.getPlatformVersion(), '42');
  // });
}
