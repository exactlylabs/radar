import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:network_connection_info/models/connection_info.dart' as CI;
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/ndt7-client-dart/ndt7_client_dart.dart';

class BackgroundSpeedTest {
  BackgroundSpeedTest({
    required RestClient restClient,
    required IHttpProvider httpProvider,
    required NetworkConnectionInfo networkConnectionInfo,
  })  : _restClient = restClient,
        _httpProvider = httpProvider,
        _networkConnectionInfo = networkConnectionInfo;

  final RestClient _restClient;
  final IHttpProvider _httpProvider;
  final NetworkConnectionInfo _networkConnectionInfo;

  CI.ConnectionInfo? _connectionInfo;
  List<Map<String, dynamic>> _responses = [];
  Position? _positionBeforeSpeedTest;
  Position? _positionAfterSpeedTest;
  ({bool isTestingDownloadSpeed, bool isTestingUploadSpeed}) _testingState =
      (isTestingDownloadSpeed: false, isTestingUploadSpeed: false);

  Future<void> startSpeedTest() async {
    _positionBeforeSpeedTest = await _getCurrentLocation();
    _testingState = (isTestingDownloadSpeed: true, isTestingUploadSpeed: false);
    test(
      config: {'protocol': 'wss'},
      onMeasurement: (data) => _onTestMeasurement(data),
      onCompleted: (data) => _onTestComplete(data),
      onError: (data) => _onTestError(jsonEncode(data)),
    );
  }

  void startUploadTest() => _testingState = (isTestingDownloadSpeed: false, isTestingUploadSpeed: true);

  void _onTestComplete(Map<String, dynamic> testResult) => _parse(testResult);

  void _onTestMeasurement(Map<String, dynamic> testResult) => _parse(testResult);

  void _onTestError(String error) => print(error);

  Future<void> _parse(Map<String, dynamic> response) async {
    final updatedResponses = List<Map<String, dynamic>>.from(_responses)..add(response);
    _responses = updatedResponses;
    if (response.containsKey('LastClientMeasurement') && response.containsKey('LastServerMeasurement')) {
      if (_testingState.isTestingDownloadSpeed) {
        startUploadTest();
      } else if (_testingState.isTestingUploadSpeed) {
        if (Platform.isAndroid && await Permission.phone.request().isGranted) {
          _connectionInfo = await _networkConnectionInfo.getNetworkConnectionInfo();
        }
        _testingState = (isTestingDownloadSpeed: false, isTestingUploadSpeed: false);
        _positionAfterSpeedTest = await _getCurrentLocation();
        _sendSpeedTestResults();
      }
    }
  }

  Future<Position?> _getCurrentLocation() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      final permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.deniedForever) {
        return null;
      }
    }
    final position = await Geolocator.getCurrentPosition();
    return position;
  }

  void _sendSpeedTestResults() {
    _httpProvider.postAndDecode(
      url: _restClient.speedTest,
      headers: {'Content-Type': 'application/json'},
      body: {
        'result': {'raw': _responses},
        'speed_test': {
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
        },
        'connection_data': _connectionInfo?.toJson(),
        'timestamp': DateTime.now().toUtc().toIso8601String(),
        'background_mode': true,
      },
    );
  }
}
