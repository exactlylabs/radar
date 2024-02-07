import 'dart:io';
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:network_connection_info/models/connection_info.dart' as CI;
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/ndt7-client-dart/ndt7_client_dart.dart';

class BackgroundSpeedTest {
  BackgroundSpeedTest({
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

  PackageInfo? _packageInfo;
  Position? _positionAfterSpeedTest;
  Position? _positionBeforeSpeedTest;
  Position? _position;
  StreamSubscription<Position>? _positionStreamSubscription;
  CI.ConnectionInfo? _connectionInfo;
  String? _sessionId;
  List<Map<String, dynamic>> _responses = [];

  ({bool isTestingDownloadSpeed, bool isTestingUploadSpeed}) _testingState =
      (isTestingDownloadSpeed: false, isTestingUploadSpeed: false);

  Future<void> startSpeedTest() async {
    setInitialValues();
    _positionBeforeSpeedTest = await _getPosition();
    if (_positionBeforeSpeedTest == null) return;
    _packageInfo = await PackageInfo.fromPlatform();
    _testingState = (isTestingDownloadSpeed: true, isTestingUploadSpeed: false);
    await test(
      config: {'protocol': 'wss'},
      onMeasurement: (data) => _onTestMeasurement(data),
      onCompleted: (data) => _onTestComplete(data),
      onError: (data) => _onTestError(data),
    );
    _positionAfterSpeedTest = await _getPosition();
    _sessionId = _localStorage.getSessionId();
    _sendSpeedTestResults();
  }

  void stopSpeedTest() {
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

    final positionStream = Geolocator.getPositionStream(locationSettings: androidSettings);
    _positionStreamSubscription = positionStream
        .handleError((error) => Sentry.captureException(error))
        .listen((updatedPosition) => _position = updatedPosition);

    _positionStreamSubscription?.pause();
  }

  void startUploadTest() =>
      _testingState = (isTestingDownloadSpeed: false, isTestingUploadSpeed: true);

  void _onTestComplete(Map<String, dynamic> testResult) => _parse(testResult);

  void _onTestMeasurement(Map<String, dynamic> testResult) => _parse(testResult);

  void _onTestError(Map<String, dynamic> error) {
    if (error.containsKey('Error')) {
      final errorMsg = error['Error'];
      Sentry.captureException(errorMsg);
    } else {
      Sentry.captureException(error);
    }
  }

  Future<void> _parse(Map<String, dynamic> response) async {
    final updatedResponses = List<Map<String, dynamic>>.from(_responses)..add(response);
    _responses = updatedResponses;
    if (response.containsKey('LastClientMeasurement') &&
        response.containsKey('LastServerMeasurement')) {
      if (_testingState.isTestingDownloadSpeed) {
        startUploadTest();
      } else if (_testingState.isTestingUploadSpeed) {
        if (Platform.isAndroid && await Permission.phone.isGranted) {
          _connectionInfo = await _networkConnectionInfo.getNetworkConnectionInfo();
        }
        _testingState = (isTestingDownloadSpeed: false, isTestingUploadSpeed: false);
      }
    }
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

    int timeout = 10;
    await Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      timeout--;
      return _position == null && timeout > 0;
    });

    _positionStreamSubscription?.pause();
    return _position;
  }

  Future<void> _sendSpeedTestResults() async {
    final speedTestResult = getSpeedTestResult();
    final result = await _httpProvider.postAndDecode(
      url: _restClient.speedTest,
      headers: {'Content-Type': 'application/json'},
      body: speedTestResult,
    );

    if (result.failure != null) {
      _localStorage.addPendingSpeedTestResult(speedTestResult);
    } else {
      await _uploadOfflineReports();
    }
  }

  Future<void> _uploadOfflineReports() async {
    final pendingSpeedTestResultsMap = _localStorage.getPendingSpeedTestResults();
    for (final pendingSpeedTestResultsKey in pendingSpeedTestResultsMap.keys) {
      final response = await _httpProvider.postAndDecode(
        url: _restClient.speedTest,
        headers: {'Content-Type': 'application/json'},
        body: pendingSpeedTestResultsMap[pendingSpeedTestResultsKey],
      );
      if (response.failure == null) {
        await _localStorage.removePendingSpeedTestResult(pendingSpeedTestResultsKey);
      }
    }
  }

  Map<String, dynamic> getSpeedTestResult() {
    return {
      'result': {'raw': _responses},
      'speed_test': {
        'tested_at': DateTime.now().toUtc().toIso8601String(),
        'latitude': _positionBeforeSpeedTest?.latitude,
        'longitude': _positionBeforeSpeedTest?.longitude,
        'latitude_before': _positionBeforeSpeedTest?.latitude,
        'longitude_before': _positionBeforeSpeedTest?.longitude,
        'accuracy_before': _positionBeforeSpeedTest?.accuracy,
        'altitude_before': _positionBeforeSpeedTest?.altitude,
        'floor_before': _positionBeforeSpeedTest?.floor,
        'heading_before': _positionBeforeSpeedTest?.heading,
        'speed_before': _positionBeforeSpeedTest?.speed,
        'speed_accuracy_before': _positionBeforeSpeedTest?.speedAccuracy,
        'longitude_after': _positionAfterSpeedTest?.longitude,
        'latitude_after': _positionAfterSpeedTest?.latitude,
        'accuracy_after': _positionAfterSpeedTest?.accuracy,
        'altitude_after': _positionAfterSpeedTest?.altitude,
        'floor_after': _positionAfterSpeedTest?.floor,
        'heading_after': _positionAfterSpeedTest?.heading,
        'speed_after': _positionAfterSpeedTest?.speed,
        'speed_accuracy_after': _positionAfterSpeedTest?.speedAccuracy,
        'version_number': _packageInfo?.version,
        'build_number': _packageInfo?.buildNumber,
        'session_id': _sessionId,
        'background_mode': true,
      },
      'connection_data': _connectionInfo?.toJson(),
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    };
  }

  void setInitialValues() {
    _responses = [];
    _sessionId = null;
    _connectionInfo = null;
    _positionAfterSpeedTest = null;
    _positionBeforeSpeedTest = null;
  }
}
