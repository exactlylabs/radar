import 'dart:io';
import 'dart:async';
import 'package:client_mobile_app/core/web_socket_client/web_socket_client.dart';
import 'package:client_mobile_app/core/ws_mobile_messages/google/protobuf/timestamp.pbserver.dart';
import 'package:client_mobile_app/core/ws_mobile_messages/ws_mobile_messages.pb.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';

class WifiTracker {
  WifiTracker({
    required LocalStorage localStorage,
    required NetworkConnectionInfo networkConnectionInfo,
    required WebSocketClient webSocketClient,
  })  : _localStorage = localStorage,
        _webSocketClient = webSocketClient,
        _networkConnectionInfo = networkConnectionInfo;

  final WebSocketClient _webSocketClient;
  final LocalStorage _localStorage;
  final NetworkConnectionInfo _networkConnectionInfo;

  Position? _position;
  // Position? _currentPosition;
  StreamSubscription<Position>? _positionStreamSubscription;
  List<Map<String, dynamic>> _responses = [];

  Future<void> startWifiTracking() async {
    setInitialValues();
    final scannedWifiResults = await _networkConnectionInfo.getWifiNetworkList();

    _responses.addAll(scannedWifiResults);
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

    final wsMessage = WSMessage(
      event: Events.SCAN_START,
      timestamp: Timestamp.fromDateTime(DateTime.now()),
    );
    _webSocketClient.send(wsMessage.writeToBuffer());
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
    final result = await _webSocketClient.send(scanResult);

    if (result.failure != null) {
      Sentry.captureException(result.failure!);
    } else {
      _responses.clear();
    }
  }

  Future<List<int>> getScannedWifiResults() async {
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
        ));
    final wsMessageToByteArray = wsMessage.writeToBuffer();
    return wsMessageToByteArray;
  }

  void setInitialValues() {
    _responses = [];
  }
}
