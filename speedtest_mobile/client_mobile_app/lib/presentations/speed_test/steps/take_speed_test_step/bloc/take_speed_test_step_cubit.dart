import 'dart:io';
import 'dart:async';

import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:ndt7_client/models/ndt7_response.dart';
import 'package:ndt7_client/models/client_response.dart';
import 'package:ndt7_client/models/server_response.dart';
import 'package:ndt7_client/models/test_completed_event.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/ndt7_js_client_handler/NDT7JSClientHandler.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_state.dart';

class TakeSpeedTestStepCubit extends Cubit<TakeSpeedTestStepState> {
  TakeSpeedTestStepCubit({
    required Ndt7Client ndt7client,
    required NetworkConnectionInfo networkConnectionInfo,
  })  : _networkConnectionInfo = networkConnectionInfo,
        super(const TakeSpeedTestStepState());

  final NetworkConnectionInfo _networkConnectionInfo;

  void startDownloadTest() async {
    final permissionsGranted = await _checkPermissions();
    if (permissionsGranted) {
      emit(const TakeSpeedTestStepState(isTestingDownloadSpeed: true));
      // _ndt7client.startDownloadTest();
    }
  }

  void startUploadTest() {
    emit(state.copyWith(isTestingUploadSpeed: true));
    // _ndt7client.startUploadTest();
  }

  void onTestComplete(String testType, String testResult) =>
      NDT7JSClientHandler.onTestComplete(testType, testResult, _parseResponse);

  void onTestMeasurement(String testType, String testResult) =>
      NDT7JSClientHandler.onTestMeasurement(testType, testResult, _parseResponse);

  void onTestError(String error) => NDT7JSClientHandler.onTestError(error, (error) => print(error));

  void _parseResponse(NDT7Response response) {
    if (response is TestCompletedEvent) {
      if (response.testType == 'Download' && state.isTestingDownloadSpeed) {
        final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(response.toJson());

        emit(
          state.copyWith(
            isTestingDownloadSpeed: false,
            latency: (state.minRtt ?? 0) / 1000,
            loss: (state.bytesRetrans ?? 0) / (state.bytesSent ?? 0) * 100,
            responses: updatedResponses,
          ),
        );
        startUploadTest();
      } else if (response.testType == 'Upload' && state.isTestingUploadSpeed) {
        final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(response.toJson());

        if (Platform.isAndroid) {
          _networkConnectionInfo.getNetworkConnectionInfo().then((connectionInfo) => emit(state.copyWith(
                isTestingUploadSpeed: false,
                finishedTesting: true,
                responses: updatedResponses,
                connectionInfo: connectionInfo,
                networkQuality: connectionInfo != null ? _getNetworkQuality(connectionInfo.rssi) : null,
              )));
        } else {
          emit(state.copyWith(
            isTestingUploadSpeed: false,
            finishedTesting: true,
            responses: updatedResponses,
          ));
        }
      }
    } else if (response is ClientResponse) {
      final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(response.toJson());
      if (response.testType == 'Download' && state.isTestingDownloadSpeed) {
        emit(state.copyWith(downloadSpeed: response.data.meanClientMbps, responses: updatedResponses));
      } else if (response.testType == 'Upload' && state.isTestingUploadSpeed) {
        emit(state.copyWith(uploadSpeed: response.data.meanClientMbps, responses: updatedResponses));
      }
    } else if (response is ServerResponse) {
      final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(response.toJson());
      final progress = _calculteProgress(response.data.tcpInfo.bytesSent ?? 0);
      emit(
        state.copyWith(
          minRtt: response.data.tcpInfo.minRTT,
          bytesRetrans: response.data.tcpInfo.bytesRetrans,
          bytesSent: response.data.tcpInfo.bytesSent,
          responses: updatedResponses,
          downloadProgress: state.isTestingDownloadSpeed ? progress : state.downloadProgress,
          uploadProgress: state.isTestingUploadSpeed ? progress : state.uploadProgress,
        ),
      );
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

  double _calculteProgress(int bytesSent) {
    if (state.isTestingDownloadSpeed) {
      return bytesSent >= 125000000 ? 1 : bytesSent / 125000000;
    } else if (state.isTestingUploadSpeed) {
      return bytesSent >= 51500 ? 1 : bytesSent / 51500;
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
}
