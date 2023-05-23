import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:network_connection_info/models/connection_info.dart' as CI;
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/ndt7-client-dart/ndt7_client_dart.dart';

class BackgroundSpeedTest {
  BackgroundSpeedTest({
    required NetworkConnectionInfo networkConnectionInfo,
    required IHttpProvider httpProvider,
    required RestClient restClient,
  })  : _httpProvider = httpProvider,
        _restClient = restClient,
        _networkConnectionInfo = networkConnectionInfo;

  final NetworkConnectionInfo _networkConnectionInfo;
  final IHttpProvider _httpProvider;
  final RestClient _restClient;

  double? _latitude;
  double? _longitude;
  CI.ConnectionInfo? _connectionInfo;
  bool _isTestingUploadSpeed = false;
  bool _isTestingDownloadSpeed = false;
  List<Map<String, dynamic>> _responses = [];

  void startSpeedTest() {
    _isTestingDownloadSpeed = true;
    test(
      config: {
        'protocol': 'wss',
      },
      onMeasurement: (data) => _onTestMeasurement(data),
      onCompleted: (data) => _onTestComplete(data),
      onError: (data) => _onTestError(jsonEncode(data)),
    );
  }

  void startUploadTest() {
    _isTestingDownloadSpeed = false;
    _isTestingUploadSpeed = true;
  }

  void _onTestComplete(Map<String, dynamic> testResult) {
    _parse(testResult);
  }

  void _onTestMeasurement(Map<String, dynamic> testResult) {
    _parse(testResult);
  }

  void _onTestError(String error) => print(error);

  Future<void> _parse(Map<String, dynamic> response) async {
    final updatedResponses = List<Map<String, dynamic>>.from(_responses)..add(response);
    _responses = updatedResponses;
    if (response.containsKey('LastClientMeasurement') && response.containsKey('LastServerMeasurement')) {
      if (_isTestingDownloadSpeed) {
        startUploadTest();
      } else if (_isTestingUploadSpeed) {
        if (Platform.isAndroid) {
          if (await Permission.phone.request().isGranted) {
            _connectionInfo = await _networkConnectionInfo.getNetworkConnectionInfo();
          }
        }
        _isTestingUploadSpeed = false;
        await _getCurrentLocation();
        _sendSpeedTestResults();
      }
    }
  }

  Future<void> _getCurrentLocation() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      final permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.deniedForever) {
        return;
      }
    }
    final position = await Geolocator.getCurrentPosition();
    _latitude = position.latitude;
    _longitude = position.longitude;
  }

  void _sendSpeedTestResults() {
    _httpProvider.postAndDecode(
      url: '${_restClient.speedTest}?client_id=$CLIENT_ID',
      headers: {'Content-Type': 'application/json'},
      body: {
        'result': {'raw': _responses},
        'speed_test': {
          'latitude': _latitude,
          'longitude': _longitude,
        },
        'connection_data': _connectionInfo?.toJson(),
        'timestamp': DateTime.now().toUtc().toIso8601String(),
        'background_mode': true,
      },
    );
  }

  static const int CLIENT_ID = 1;
}
