import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:network_connection_info/network_connection_info_method_channel.dart';

void main() {
  MethodChannelNetworkConnectionInfo platform = MethodChannelNetworkConnectionInfo();
  const MethodChannel channel = MethodChannel('network_connection_info');

  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    channel.setMockMethodCallHandler((MethodCall methodCall) async {
      return '42';
    });
  });

  tearDown(() {
    channel.setMockMethodCallHandler(null);
  });
}
