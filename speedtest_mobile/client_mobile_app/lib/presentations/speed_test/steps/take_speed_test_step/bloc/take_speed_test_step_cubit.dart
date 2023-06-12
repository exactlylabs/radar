import 'dart:convert';
import 'dart:io';
import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/ndt7-client-dart/ndt7_client_dart.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_state.dart';

class TakeSpeedTestStepCubit extends Cubit<TakeSpeedTestStepState> {
  TakeSpeedTestStepCubit({
    required NetworkConnectionInfo networkConnectionInfo,
  })  : _networkConnectionInfo = networkConnectionInfo,
        super(const TakeSpeedTestStepState());

  final NetworkConnectionInfo _networkConnectionInfo;

  void startTest() async {
    final positionBeforeSpeedTest = await _getCurrentLocation();
    if (positionBeforeSpeedTest != null) {
      emit(state.copyWith(positionBeforeSpeedTest: positionBeforeSpeedTest));
    }
    await test(
      config: {'protocol': 'wss'},
      onMeasurement: (data) => onTestMeasurement(data),
      onCompleted: (data) => onTestComplete(data),
      onError: (data) => onTestError(jsonEncode(data)),
    );
  }

  void startDownloadTest() async {
    final permissionsGranted = await _checkPermissions();
    if (permissionsGranted) {
      emit(const TakeSpeedTestStepState(isTestingDownloadSpeed: true));
      startTest();
    }
  }

  void startUploadTest() => emit(state.copyWith(isTestingUploadSpeed: true));

  void onTestComplete(Map<String, dynamic> testResult) => _parse(testResult);

  void onTestMeasurement(Map<String, dynamic> testResult) => _parse(testResult);

  void onTestError(String error) => Sentry.captureException(error);

  Future<void> _parse(Map<String, dynamic> response) async {
    final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(response);
    if (response.containsKey('Source') && response['Source'] == 'server') {
      final bytes = (response['type'] == 'download') ? 'BytesSent' : 'BytesReceived';
      final numBytes = response['Data']['TCPInfo'][bytes];
      final elapsedTime = response['Data']['BBRInfo']['ElapsedTime'];
      final meanMbps = (numBytes * 8) / elapsedTime;
      final progress = _calculteProgress(numBytes);
      emit(
        state.copyWith(
          minRtt: response['Data']['TCPInfo']['MinRTT'],
          bytesRetrans: response['Data']['TCPInfo']['BytesRetrans'],
          bytesSent: response['Data']['TCPInfo']['BytesSent'],
          responses: updatedResponses,
          downloadProgress: state.isTestingDownloadSpeed ? progress : state.downloadProgress,
          uploadProgress: state.isTestingUploadSpeed ? progress : state.uploadProgress,
          downloadSpeed: response['type'] == 'download' ? meanMbps : state.downloadSpeed,
          uploadSpeed: response['type'] == 'upload' ? meanMbps : state.uploadSpeed,
        ),
      );
    } else if (response.containsKey('LastClientMeasurement') &&
        response.containsKey('LastServerMeasurement')) {
      if (response['type'] == 'download' && state.isTestingDownloadSpeed) {
        emit(
          state.copyWith(
            isTestingDownloadSpeed: false,
            latency: (state.minRtt ?? 0) / 1000,
            loss: (state.bytesRetrans ?? 0) / (state.bytesSent ?? 0) * 100,
            responses: updatedResponses,
          ),
        );
        startUploadTest();
      } else if (response['type'] == 'upload' && state.isTestingUploadSpeed) {
        final positionAfterSpeedTest = await _getCurrentLocation();
        if (Platform.isAndroid) {
          _networkConnectionInfo
              .getNetworkConnectionInfo()
              .then((connectionInfo) => emit(state.copyWith(
                    isTestingUploadSpeed: false,
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
    if (await Permission.phone.request().isGranted) {
      return true;
    }
    return false;
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
}
