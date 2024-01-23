import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';

class WifiTracker {
  WifiTracker({
    required RestClient restClient,
    required LocalStorage localStorage,
    required IHttpProvider httpProvider,
    required NetworkConnectionInfo networkConnectionInfo,
  })  : _restClient = restClient,
        _localStorage = localStorage,
        _httpProvider = httpProvider,
        _networkConnectionInfo = networkConnectionInfo;

  final RestClient _restClient;
  final LocalStorage _localStorage;
  final IHttpProvider _httpProvider;
  final NetworkConnectionInfo _networkConnectionInfo;

  Position? _position;
  StreamSubscription<Position>? _positionStreamSubscription;
  List<Map<String, dynamic>> _responses = [];

  Future<void> startWifiTracking() async {
    final scannedWifiResults = await _networkConnectionInfo.getWifiNetworkList();

    _responses.addAll(scannedWifiResults);
    _sendScannedWifiResults();
  }

  void stopWifiTracking() {
    _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
    _position = null;
  }

  void setupLocationSettings() {
    if (Platform.isIOS) return;
    final androidSettings = AndroidSettings(
      accuracy: LocationAccuracy.best,
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

    _positionStreamSubscription?.pause();
  }

  Future<Position?> _getPosition() async {
    if (Platform.isIOS) return null;
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      final permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null;
      }
    }

    _position = null;
    return _getLocationUpdate();
  }

  Future<Position?> _getLocationUpdate() async {
    _positionStreamSubscription?.resume();

    int timeout = 1;
    await Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      timeout--;
      return _position == null && timeout > 0;
    });

    _positionStreamSubscription?.pause();
    return _position;
  }

  Future<void> _sendScannedWifiResults() async {
    final scannedWifiResults = await getScannedWifiResults();
    final jsonScannedWifiResults = jsonEncode(scannedWifiResults);
    final result = await _httpProvider.postAndDecode(
      url: _restClient.wifiTracking,
      headers: {'Content-Type': 'application/json'},
      body: jsonScannedWifiResults,
    );

    if (result.failure != null) {
      Sentry.captureException(result.failure!);
    } else {
      _responses.clear();
    }
  }

  Future<Map<String, dynamic>> getScannedWifiResults() async {
    return {
      'result': {'raw': jsonEncode(_responses)}
    };
  }
}
