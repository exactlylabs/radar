import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:client_mobile_app/core/ws_mobile_messages/google/protobuf/struct.pb.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:geolocator/geolocator.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/web_socket_client/web_socket_client.dart';
import 'package:client_mobile_app/core/ws_mobile_messages/ws_mobile_messages.pb.dart';
import 'package:client_mobile_app/core/ws_mobile_messages/google/protobuf/timestamp.pbserver.dart';

class WifiTracker {
  WifiTracker({
    required LocalStorage localStorage,
    required NetworkConnectionInfo networkConnectionInfo,
    required WebSocketClient webSocketClient,
    required ConfigurationMonitoring configurationMonitoring,
  })  : _localStorage = localStorage,
        _webSocketClient = webSocketClient,
        _configurationMonitoring = configurationMonitoring,
        _networkConnectionInfo = networkConnectionInfo;

  final WebSocketClient _webSocketClient;
  final LocalStorage _localStorage;
  final NetworkConnectionInfo _networkConnectionInfo;
  final ConfigurationMonitoring _configurationMonitoring;

  Position? _position;
  StreamSubscription<Position>? _positionStreamSubscription;
  List<Map<String, dynamic>> _responses = [];
  PackageInfo? _packageInfo;
  String? _sessionId;
  Map<String, dynamic>? _deviceAndPermissionsState;

  Future<void> startWifiTracking() async {
    setInitialValues();
    final scannedWifiResults = await _networkConnectionInfo.getWifiNetworkList();

    _responses.addAll(scannedWifiResults);
    _sessionId = _localStorage.getSessionId();
    _packageInfo = await PackageInfo.fromPlatform();
    _deviceAndPermissionsState = await _configurationMonitoring.getDeviceAndPermissionsState();
    _sendScannedWifiResults();
  }

  void stopWifiTracking() {
    _webSocketClient.close();
    _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
    _position = null;
  }

  void setupWifiTracking() {
    if (Platform.isIOS) return;
    _webSocketClient.open();

    final androidSettings = AndroidSettings(
      accuracy: LocationAccuracy.bestForNavigation,
      forceLocationManager: true,
      foregroundNotificationConfig: const ForegroundNotificationConfig(
        notificationText: "",
        notificationTitle: "",
        enableWakeLock: true,
      ),
    );

    final positionStream =
        GeolocatorPlatform.instance.getPositionStream(locationSettings: androidSettings);
    _positionStreamSubscription = positionStream
        .handleError((error) => Sentry.captureException(error))
        .listen((updatedPosition) {
      _position = updatedPosition;
    });
  }

  Future<void> _sendScannedWifiResults() async {
    final scanResult = await getScannedWifiResults();
    if (scanResult == null) {
      Sentry.captureException(Exception('Failed to get scanned wifi results'));
      return;
    }
    final scanResultSent = _webSocketClient.send(scanResult);

    if (!scanResultSent) {
      Sentry.captureException(Exception('Failed to send scanned wifi results'));
    } else {
      _responses.clear();
    }
  }

  Future<List<int>?> getScannedWifiResults() async {
    print('Scanned wifi results: $_responses');
    try {
      final wsMessage = WSMessage(
        event: Events.SCAN_RESULT,
        scanResult: ScanResult(
            scannedAps: _responses
                .map((response) => ScannedAP(
                      bssid: response['bssid'],
                      ssid: response['ssid'],
                      capabilities: response['capabilities'],
                      level: response['level'],
                      frequency: response['frequency'],
                      centerFreq0: response['centerFreq0'],
                      centerFreq1: response['centerFreq1'],
                      is80211mcResponder: response['is80211mcResponder'],
                      channelWidth: response['channelWidth'],
                      isPasspointNetwork: response['isPasspointNetwork'],
                      wifiStandard: response['wifiStandard'],
                      timestamp: Timestamp.fromDateTime(
                          DateTime.fromMillisecondsSinceEpoch(response['timestamp'])),
                    ))
                .toList(),
            latitude: _position?.latitude,
            longitude: _position?.longitude,
            metadata: Struct(
              fields: {
                'version_number': Value(stringValue: _packageInfo?.version),
                'build_number': Value(stringValue: _packageInfo?.buildNumber),
                'device_and_permissions':
                    getDeviceAndPermissionsState(_deviceAndPermissionsState ?? {}),
              },
            )),
        sessionId: _sessionId,
      );
      final wsMessageToByteArray = wsMessage.writeToBuffer();
      return wsMessageToByteArray;
    } catch (e) {
      print('Failed to get scanned wifi results: $e');
      Sentry.captureException(e);
      return null;
    }
  }

  Value getDeviceAndPermissionsState(Map<String, dynamic> data) {
    Map<String, Value> fields = {};
    data.forEach((key, value) {
      if (value is String) {
        fields[key] = Value(stringValue: value);
      } else if (value is bool) {
        fields[key] = Value(boolValue: value);
      } else if (value is int) {
        fields[key] = Value(numberValue: value.toDouble());
      } else if (value is double) {
        fields[key] = Value(numberValue: value);
      } else if (value is List) {
        fields[key] =
            Value(listValue: ListValue(values: value.map((e) => Value(stringValue: e)).toList()));
      }
    });
    return Value(structValue: Struct(fields: fields));
  }

  void setInitialValues() {
    _responses = [];
    _sessionId = null;
    _deviceAndPermissionsState = null;
  }
}
