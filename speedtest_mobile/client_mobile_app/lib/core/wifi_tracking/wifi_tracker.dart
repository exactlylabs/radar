import 'dart:io';
import 'dart:async';
// import 'package:geolocator/geolocator.dart';
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

  // Position? _position;
  // StreamSubscription<Position>? _positionStreamSubscription;
  String? _sessionId;
  List<Map<String, dynamic>> _responses = [];
  DateTime _lastUpload = DateTime.now();

  Future<void> startWifiTracking() async {
    final scannedWifiResults = await _networkConnectionInfo.getWifiNetworkList();

    _responses.addAll(scannedWifiResults);
    _sessionId = _localStorage.getSessionId();
    _sendScannedWifiResults();
  }

  void stopWifiTracking() {
    // _positionStreamSubscription?.cancel();
    // _positionStreamSubscription = null;
    // _position = null;
  }

  void setupLocationSettings() {
    // if (Platform.isIOS) return;
    // final androidSettings = AndroidSettings(
    //   accuracy: LocationAccuracy.best,
    //   forceLocationManager: true,
    //   useMSLAltitude: true,
    //   foregroundNotificationConfig: const ForegroundNotificationConfig(
    //     notificationText: "",
    //     notificationTitle: "",
    //     enableWakeLock: true,
    //   ),
    // );

    // final positionStream =
    //     GeolocatorPlatform.instance.getPositionStream(locationSettings: androidSettings);
    // _positionStreamSubscription = positionStream
    //     .handleError((error) => Sentry.captureException(error))
    //     .listen((updatedPosition) => _position = updatedPosition);

    // _positionStreamSubscription?.pause();
  }

  // Future<Position?> _getPosition() async {
  //   if (Platform.isIOS) return null;
  //   final permission = await Geolocator.checkPermission();
  //   if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
  //     final permission = await Geolocator.requestPermission();
  //     if (permission == LocationPermission.denied ||
  //         permission == LocationPermission.deniedForever) {
  //       return null;
  //     }
  //   }

  //   _position = null;
  //   return _getLocationUpdate();
  // }

  // Future<Position?> _getLocationUpdate() async {
  //   // _positionStreamSubscription?.resume();

  //   int timeout = 10;
  //   await Future.doWhile(() async {
  //     await Future.delayed(const Duration(seconds: 1));
  //     timeout--;
  //     return _position == null && timeout > 0;
  //   });

  //   // _positionStreamSubscription?.pause();
  //   return _position;
  // }

  Future<void> _sendScannedWifiResults() async {
    // final speedTestResult = await getScannedWifiResults();
    final result = await _httpProvider.postAndDecode(
      url: 'https://neat-hotels-allow.loca.lt/log',
      headers: {'Content-Type': 'application/json'},
      body: {'log': DateTime.now().toUtc().toIso8601String()},
    );

    if (result.failure != null) {
      // _localStorage.addPendingSpeedTestResult(speedTestResult);
      print(result.failure);
    } else {
      _responses.clear();
      // await _uploadOfflineReports();
    }
  }

  // Future<void> _uploadOfflineReports() async {
  //   final pendingSpeedTestResultsMap = _localStorage.getPendingSpeedTestResults();
  //   for (final pendingSpeedTestResultsKey in pendingSpeedTestResultsMap.keys) {
  //     final response = await _httpProvider.postAndDecode(
  //       url: _restClient.speedTest,
  //       headers: {'Content-Type': 'application/json'},
  //       body: pendingSpeedTestResultsMap[pendingSpeedTestResultsKey],
  //     );
  //     if (response.failure == null) {
  //       await _localStorage.removePendingSpeedTestResult(pendingSpeedTestResultsKey);
  //     }
  //   }
  // }

  // Future<Map<String, dynamic>> getScannedWifiResults() async {
  //   final position = await _getPosition();
  //   return {
  //     'result': {'raw': _responses},
  //     'speed_test': {
  //       'tested_at': DateTime.now().toUtc().toIso8601String(),
  //       'latitude': position?.latitude,
  //       'longitude': position?.longitude,
  //       'accuracy': position?.accuracy,
  //       'altitude': position?.altitude,
  //       'floor': position?.floor,
  //       'heading': position?.heading,
  //       'speed': position?.speed,
  //       'speed_accuracy': position?.speedAccuracy,
  //       'session_id': _sessionId,
  //       'background_mode': true,
  //     },
  //     'timestamp': DateTime.now().toUtc().toIso8601String(),
  //   };
  // }
}
