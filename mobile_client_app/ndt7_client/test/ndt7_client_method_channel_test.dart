import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ndt7_client/ndt7_client_method_channel.dart';

void main() {
  MethodChannelNdt7Client platform = MethodChannelNdt7Client();
  const MethodChannel channel = MethodChannel('ndt7_client');

  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    channel.setMockMethodCallHandler((MethodCall methodCall) async {
      return '42';
    });
  });

  tearDown(() {
    channel.setMockMethodCallHandler(null);
  });

  test('getPlatformVersion', () async {
    expect(await platform.getPlatformVersion(), '42');
  });
}
