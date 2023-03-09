import 'dart:async';
import 'dart:io';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:ndt7_client/models/client_response.dart';
import 'package:ndt7_client/models/server_response.dart';
import 'package:ndt7_client/models/test_completed_event.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/speed_test/utils/responses_parser.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_state.dart';

class TakeSpeedTestStepCubit extends Cubit<TakeSpeedTestStepState> {
  TakeSpeedTestStepCubit({
    required Ndt7Client ndt7client,
    required NetworkConnectionInfo networkConnectionInfo,
  })  : _ndt7client = ndt7client,
        _networkConnectionInfo = networkConnectionInfo,
        super(const TakeSpeedTestStepState()) {
    _subscribeToNdt7Client();
  }

  late StreamSubscription _ndt7clientSubscription;
  final Ndt7Client _ndt7client;
  final NetworkConnectionInfo _networkConnectionInfo;

  Map<String, dynamic>? _lastServerMeasurement;
  Map<String, dynamic>? _lastClientMeasurement;

  void startDownloadTest() async {
    final permissionsGranted = await _checkPermissions();
    if (permissionsGranted) {
      emit(const TakeSpeedTestStepState(isTestingDownloadSpeed: true));
      _ndt7client.startDownloadTest();
    }
  }

  void startUploadTest() {
    emit(state.copyWith(isTestingUploadSpeed: true));
    _ndt7client.startUploadTest();
  }

  void _subscribeToNdt7Client() {
    _ndt7clientSubscription = _ndt7client.data.listen(
      (data) {
        if (data is TestCompletedEvent) {
          if (state.isTestingDownloadSpeed) {
            var updatedResponses = state.responses;
            if (_lastClientMeasurement != null && _lastServerMeasurement != null) {
              updatedResponses = _addLastMeasurement(state.responses, _lastClientMeasurement!, _lastServerMeasurement!);
            }

            emit(
              state.copyWith(
                isTestingDownloadSpeed: false,
                latency: (state.minRtt ?? 0) / 1000,
                loss: (state.bytesRetrans ?? 0) / (state.bytesSent ?? 0) * 100,
                responses: updatedResponses,
              ),
            );
            _lastClientMeasurement = null;
            _lastServerMeasurement = null;
            startUploadTest();
          } else if (state.isTestingUploadSpeed) {
            var updatedResponses = state.responses;
            if (_lastClientMeasurement != null && _lastServerMeasurement != null) {
              updatedResponses = _addLastMeasurement(state.responses, _lastClientMeasurement!, _lastServerMeasurement!);
            }

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
        } else if (data is ClientResponse) {
          _lastClientMeasurement = ResponsesParser.parseClientResponse(data);
          final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(_lastClientMeasurement!);
          if (state.isTestingDownloadSpeed) {
            emit(state.copyWith(downloadSpeed: data.appInfo.meanClientMbps, responses: updatedResponses));
          } else if (state.isTestingUploadSpeed) {
            emit(state.copyWith(uploadSpeed: data.appInfo.meanClientMbps, responses: updatedResponses));
          }
        } else if (data is ServerResponse) {
          _lastServerMeasurement = ResponsesParser.parseServerResponse(data);
          final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(_lastServerMeasurement!);
          final progress = _calculteProgress(data.tcpInfo.bytesSent ?? 0);
          emit(
            state.copyWith(
              minRtt: data.tcpInfo.minRTT,
              bytesRetrans: data.tcpInfo.bytesRetrans,
              bytesSent: data.tcpInfo.bytesSent,
              responses: updatedResponses,
              downloadProgress: state.isTestingDownloadSpeed ? progress : state.downloadProgress,
              uploadProgress: state.isTestingUploadSpeed ? progress : state.uploadProgress,
            ),
          );
        }
      },
    );
  }

  void resetSpeedTest() => emit(const TakeSpeedTestStepState());

  @override
  Future<void> close() {
    _ndt7clientSubscription.cancel();
    return super.close();
  }

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

  List<Map<String, dynamic>> _addLastMeasurement(List<Map<String, dynamic>> responses,
      Map<String, dynamic> lastClientMeasurement, Map<String, dynamic> lastServerMeasurement) {
    final lastMeasurements = {
      'LastClientMeasurement': lastClientMeasurement['Data'],
      'LastServerMeasurement': lastServerMeasurement['Data'],
      'type': lastClientMeasurement['type'],
    };
    return List<Map<String, dynamic>>.from(responses)..add(lastMeasurements);
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
    if (await Permission.phone.request().isGranted) {
      return true;
    }
    return false;
  }
}
