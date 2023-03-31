import 'dart:io';
import 'dart:async';

import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:ndt7_client/models/ndt7_response.dart';
import 'package:ndt7_client/models/test_completed_event.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:network_connection_info/models/connection_info.dart' as CI;
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/ndt7_js_client_handler/NDT7JSClientHandler.dart';

class BackgroundSpeedTest {
  BackgroundSpeedTest({
    required Ndt7Client ndt7client,
    required NetworkConnectionInfo networkConnectionInfo,
    required IHttpProvider httpProvider,
    required RestClient restClient,
    required String mode,
  })  : _httpProvider = httpProvider,
        _restClient = restClient,
        _mode = mode,
        _networkConnectionInfo = networkConnectionInfo;

  final NetworkConnectionInfo _networkConnectionInfo;
  final IHttpProvider _httpProvider;
  final RestClient _restClient;
  final String _mode;

  double? _latitude;
  double? _longitude;
  CI.ConnectionInfo? _connectionInfo;
  bool _isTestingUploadSpeed = false;
  bool _isTestingDownloadSpeed = false;
  List<Map<String, dynamic>> _responses = [];
  late FlutterWebviewPlugin flutterWebViewPlugin;

  void startSpeedTest() {
    _isTestingDownloadSpeed = true;
    final javascriptChannels = NDT7JSClientHandler.setJavascriptsChannels(
      onTestComplete: _onTestComplete,
      onTestMeasurement: _onTestMeasurement,
      onTestError: _onTestError,
    );
    flutterWebViewPlugin = FlutterWebviewPlugin();
    NDT7JSClientHandler.launchClient(flutterWebViewPlugin, javascriptChannels);
  }

  void startUploadTest() => _isTestingUploadSpeed = true;

  void _onTestComplete(String testType, String testResult) =>
      NDT7JSClientHandler.onTestComplete(testType, testResult, _parseResponse);

  void _onTestMeasurement(String testType, String testResult) =>
      NDT7JSClientHandler.onTestMeasurement(testType, testResult, _parseResponse);

  void _onTestError(String error) => NDT7JSClientHandler.onTestError(error, (error) => print(error));

  Future<void> _parseResponse(NDT7Response response) async {
    final updatedResponses = List<Map<String, dynamic>>.from(_responses)..add(response.toJson());
    _responses = updatedResponses;
    if (response is TestCompletedEvent) {
      if (response.testType == 'Download' && _isTestingDownloadSpeed) {
        startUploadTest();
      } else if (response.testType == 'Upload' && _isTestingUploadSpeed) {
        if (Platform.isAndroid) {
          _connectionInfo = await _networkConnectionInfo.getNetworkConnectionInfo();
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
      url: _restClient.speedTest,
      headers: {'Content-Type': 'application/json'},
      body: {
        'result': {'raw': _responses},
        'speed_test': {
          'latitude': _latitude,
          'longitude': _longitude,
        },
        'connection_data': _connectionInfo?.toJson(),
      },
    );
    final body = {
      'mode': _mode,
    };
    Dio().post('https://17ac-45-239-131-5.ngrok.io/timestamps', data: body);
  }
}
