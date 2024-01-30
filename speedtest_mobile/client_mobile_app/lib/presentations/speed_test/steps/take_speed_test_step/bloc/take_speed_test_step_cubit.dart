import 'dart:io';
import 'dart:async';

import 'package:geolocator/geolocator.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/ndt7-client-dart/ndt7_client_dart.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_state.dart';

class TakeSpeedTestStepCubit extends Cubit<TakeSpeedTestStepState> {
  TakeSpeedTestStepCubit({
    required NetworkConnectionInfo networkConnectionInfo,
    required ConfigurationMonitoring configurationMonitoring,
  })  : _networkConnectionInfo = networkConnectionInfo,
        _configurationMonitoring = configurationMonitoring,
        super(const TakeSpeedTestStepState());

  final NetworkConnectionInfo _networkConnectionInfo;
  final ConfigurationMonitoring _configurationMonitoring;

  void startTest() async {
    final positionBeforeSpeedTest = await _getCurrentLocation();
    final deviceAndPermissionsState = await _configurationMonitoring.getDeviceAndPermissionsState();

    emit(state.copyWith(
      positionBeforeSpeedTest: positionBeforeSpeedTest,
      deviceAndPermissionsState: deviceAndPermissionsState,
    ));

    await test(
      config: {'protocol': 'wss'},
      onMeasurement: (data) => onTestMeasurement(data),
      onCompleted: (data) => onTestComplete(data),
      onError: (data) => onTestError(data),
    );
  }

  void startDownloadTest() async {
    final permissionsGranted = await _checkPermissions();
    if (permissionsGranted) {
      emit(const TakeSpeedTestStepState(
          isTestingDownloadSpeed: true, requestPhonePermission: false));
      startTest();
    } else {
      emit(state.copyWith(requestPhonePermission: true));
    }
  }

  void startUploadTest() => emit(state.copyWith(isTestingUploadSpeed: true));

  void onTestComplete(Map<String, dynamic> testResult) => _parse(testResult);

  void onTestMeasurement(Map<String, dynamic> testResult) => _parse(testResult);

  void onTestError(Map<String, dynamic> error) {
    if (error.containsKey('Error')) {
      final errorMsg = error['Error'];
      Sentry.captureException(errorMsg);
    } else {
      Sentry.captureException(error);
    }
  }

  Future<void> _parse(Map<String, dynamic> response) async {
    final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(response);
    if (response.containsKey('Source') && response['Source'] == 'server') {
      final bytesAndMeanMbps =
          _getBytesAndMeanMbps(response['Data'], response['type'] == 'download');
      final progress = _calculteProgress(bytesAndMeanMbps.bytes);
      emit(
        state.copyWith(
          minRtt: response['Data']['TCPInfo']['MinRTT'],
          bytesRetrans: response['Data']['TCPInfo']['BytesRetrans'],
          bytesSent: response['Data']['TCPInfo']['BytesSent'],
          responses: updatedResponses,
          downloadProgress: state.isTestingDownloadSpeed ? progress : state.downloadProgress,
          uploadProgress: state.isTestingUploadSpeed ? progress : state.uploadProgress,
          downloadSpeed:
              response['type'] == 'download' ? bytesAndMeanMbps.mbps : state.downloadSpeed,
          uploadSpeed: response['type'] == 'upload' ? bytesAndMeanMbps.mbps : state.uploadSpeed,
        ),
      );
    } else if (response.containsKey('LastClientMeasurement') &&
        response.containsKey('LastServerMeasurement')) {
      if (response['type'] == 'download' && state.isTestingDownloadSpeed) {
        final bytesAndMeanMbps = _getBytesAndMeanMbps(response['LastServerMeasurement'], true);
        emit(
          state.copyWith(
            isTestingDownloadSpeed: false,
            downloadSpeed: bytesAndMeanMbps.mbps,
            latency: (state.minRtt ?? 0) / 1000,
            loss: (state.bytesRetrans ?? 0) / (state.bytesSent ?? 1) * 100,
            responses: updatedResponses,
          ),
        );
        startUploadTest();
      } else if (response['type'] == 'upload' && state.isTestingUploadSpeed) {
        final bytesAndMeanMbps = _getBytesAndMeanMbps(response['LastServerMeasurement'], false);
        final positionAfterSpeedTest = await _getCurrentLocation();
        if (Platform.isAndroid) {
          _networkConnectionInfo
              .getNetworkConnectionInfo()
              .then((connectionInfo) => emit(state.copyWith(
                    isTestingUploadSpeed: false,
                    uploadSpeed: bytesAndMeanMbps.mbps,
                    finishedTesting: true,
                    responses: updatedResponses,
                    connectionInfo: connectionInfo,
                    positionAfterSpeedTest: positionAfterSpeedTest,
                    networkQuality:
                        connectionInfo != null ? _getNetworkQuality(connectionInfo.rssi) : null,
                  )));
        } else {
          emit(state.copyWith(
            finishedTesting: true,
            isTestingUploadSpeed: false,
            responses: updatedResponses,
            positionAfterSpeedTest: positionAfterSpeedTest,
            uploadSpeed: bytesAndMeanMbps.mbps,
          ));
        }
      }
    }
  }

  void resetSpeedTest() => emit(const TakeSpeedTestStepState());

  String? _getNetworkQuality(int rssi) {
    if (rssi >= -85) {
      return Strings.goodNetworkQuality;
    } else if (rssi >= -90 && rssi <= -86) {
      return Strings.regularNetworkQuality;
    } else if (rssi < -90) {
      return Strings.badNetworkQuality;
    }
    return null;
  }

  ({int bytes, double mbps}) _getBytesAndMeanMbps(Map<String, dynamic> response, bool isDownload) {
    final bytes = isDownload ? 'BytesSent' : 'BytesReceived';
    final numBytes = response['TCPInfo'][bytes];
    final elapsedTime = response['BBRInfo']['ElapsedTime'];
    return (bytes: numBytes, mbps: (numBytes * 8) / elapsedTime);
  }

  double _calculteProgress(int bytes) {
    const int maxDownloadBytes = 125000000;
    const int maxUploadBytes = 35190155;
    const double maxProgress = 1.0;
    if (state.isTestingDownloadSpeed) {
      return bytes >= maxDownloadBytes ? maxProgress : bytes / maxDownloadBytes;
    } else if (state.isTestingUploadSpeed) {
      return bytes >= maxUploadBytes ? maxProgress : bytes / maxUploadBytes;
    }
    return 0;
  }

  Future<bool> _checkPermissions() async {
    if (Platform.isIOS) return true;
    return await Permission.phone.isGranted;
  }

  Future<void> requestPhonePermission() async {
    await Permission.phone.request();
    startDownloadTest();
  }

  Future<Position?> _getCurrentLocation() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      final permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null;
      }
    }

    final position = await Geolocator.getCurrentPosition();
    return position;
  }
}
