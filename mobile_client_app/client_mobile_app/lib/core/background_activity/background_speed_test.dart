import 'dart:async';
import 'dart:io';

import 'package:geolocator/geolocator.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:ndt7_client/models/client_response.dart';
import 'package:ndt7_client/models/server_response.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:ndt7_client/models/test_completed_event.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:network_connection_info/models/connection_info.dart' as CI;
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/presentations/speed_test/utils/responses_parser.dart';

class BackgroundSpeedTest {
  BackgroundSpeedTest({
    required Ndt7Client ndt7client,
    required NetworkConnectionInfo networkConnectionInfo,
    required IHttpProvider httpProvider,
    required RestClient restClient,
  })  : _ndt7client = ndt7client,
        _httpProvider = httpProvider,
        _restClient = restClient,
        _networkConnectionInfo = networkConnectionInfo {
    _subscribeToNdt7Client();
  }

  late StreamSubscription _ndt7clientSubscription;
  final Ndt7Client _ndt7client;
  final NetworkConnectionInfo _networkConnectionInfo;
  final IHttpProvider _httpProvider;
  final RestClient _restClient;

  Map<String, dynamic>? _lastServerMeasurement;
  Map<String, dynamic>? _lastClientMeasurement;
  bool _isTestingDownloadSpeed = false;
  bool _isTestingUploadSpeed = false;
  List<Map<String, dynamic>> _responses = [];
  CI.ConnectionInfo? _connectionInfo;
  double? _latitude;
  double? _longitude;

  // NDT7 SPEED TEST
  void startSpeedTest() => _startDownloadTest();

  void close() => _ndt7clientSubscription.cancel();

  void _startDownloadTest() {
    _isTestingUploadSpeed = false;
    _isTestingDownloadSpeed = true;
    _ndt7client.startDownloadTest();
  }

  void _startUploadTest() {
    _isTestingDownloadSpeed = false;
    _isTestingUploadSpeed = true;
    _ndt7client.startUploadTest();
  }

  void _subscribeToNdt7Client() {
    _ndt7clientSubscription = _ndt7client.data.listen(
      (data) async {
        if (data is TestCompletedEvent) {
          if (_isTestingDownloadSpeed) {
            var updatedResponses = _responses;
            if (_lastClientMeasurement != null && _lastServerMeasurement != null) {
              updatedResponses = _addLastMeasurement(_responses, _lastClientMeasurement!, _lastServerMeasurement!);
            }
            _lastClientMeasurement = null;
            _lastServerMeasurement = null;
            _responses = updatedResponses;
            _startUploadTest();
          } else if (_isTestingUploadSpeed) {
            var updatedResponses = _responses;
            if (_lastClientMeasurement != null && _lastServerMeasurement != null) {
              updatedResponses = _addLastMeasurement(_responses, _lastClientMeasurement!, _lastServerMeasurement!);
            }

            if (Platform.isAndroid) {
              _networkConnectionInfo
                  .getNetworkConnectionInfo()
                  .then((connectionInfo) => _connectionInfo = connectionInfo);
            }
            _isTestingUploadSpeed = false;
            _responses = updatedResponses;
          }

          if (!_isTestingDownloadSpeed && !_isTestingUploadSpeed) {
            await _getCurrentLocation();
            _sendSpeedTestResults();
          }
        } else if (data is ClientResponse) {
          _lastClientMeasurement = ResponsesParser.parseClientResponse(data);
          final updatedResponses = List<Map<String, dynamic>>.from(_responses)..add(_lastClientMeasurement!);
          _responses = updatedResponses;
        } else if (data is ServerResponse) {
          _lastServerMeasurement = ResponsesParser.parseServerResponse(data);
          final updatedResponses = List<Map<String, dynamic>>.from(_responses)..add(_lastServerMeasurement!);
          _responses = updatedResponses;
        }
      },
    );
  }

  List<Map<String, dynamic>> _addLastMeasurement(List<Map<String, dynamic>> responses,
      Map<String, dynamic> lastClientMeasurement, Map<String, dynamic> lastServerMeasurement) {
    final lastMeasurements = {
      'LastClientMeasurement': lastClientMeasurement['Data'],
      'LastServerMeasurement': lastServerMeasurement['Data'],
      'type': lastClientMeasurement['type'],
    };
    return List<Map<String, dynamic>>.from(responses)..add(lastMeasurements);
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
  }
}
