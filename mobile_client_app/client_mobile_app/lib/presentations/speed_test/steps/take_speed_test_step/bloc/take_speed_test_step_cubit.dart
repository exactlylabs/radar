import 'dart:async';

import 'package:client_mobile_app/presentations/speed_test/utils/responses_parser.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ndt7_client/models/test_completed_event.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:ndt7_client/models/client_response.dart';
import 'package:ndt7_client/models/server_response.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_state.dart';

class TakeSpeedTestStepCubit extends Cubit<TakeSpeedTestStepState> {
  TakeSpeedTestStepCubit({
    required Ndt7Client ndt7client,
  })  : _ndt7client = ndt7client,
        super(const TakeSpeedTestStepState()) {
    _subscribeToNdt7Client();
  }

  late StreamSubscription _ndt7clientSubscription;
  final Ndt7Client _ndt7client;

  Map<String, dynamic>? _lastServerMeasurement;
  Map<String, dynamic>? _lastClientMeasurement;

  void startDownloadTest() {
    emit(const TakeSpeedTestStepState(isTestingDownloadSpeed: true));
    _ndt7client.startDownloadTest();
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
            emit(state.copyWith(
              isTestingUploadSpeed: false,
              finishedTesting: true,
              responses: updatedResponses,
            ));
          }
        } else if (data is ClientResponse) {
          _lastClientMeasurement = ResponsesParser.parseClientResponse(data);
          final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(_lastClientMeasurement!);
          final speed = convertToMbps(data.appInfo.elapsedTime, data.appInfo.numBytes);
          if (state.isTestingDownloadSpeed) {
            emit(state.copyWith(downloadSpeed: speed, responses: updatedResponses));
          } else if (state.isTestingUploadSpeed) {
            emit(state.copyWith(uploadSpeed: speed, responses: updatedResponses));
          }
        } else if (data is ServerResponse) {
          _lastServerMeasurement = ResponsesParser.parseServerResponse(data);
          final updatedResponses = List<Map<String, dynamic>>.from(state.responses)..add(_lastServerMeasurement!);
          emit(
            state.copyWith(
              minRtt: data.tcpInfo.minRTT,
              bytesRetrans: data.tcpInfo.bytesRetrans,
              bytesSent: data.tcpInfo.bytesSent,
              responses: updatedResponses,
            ),
          );
        }
      },
    );
  }

  @override
  Future<void> close() {
    _ndt7clientSubscription.cancel();
    return super.close();
  }

  double convertToMbps(int elapsedTime, int numBytes) {
    final time = elapsedTime / 1e6;
    double speed = numBytes / time;
    speed *= 8;
    speed /= 1e6;
    return speed;
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
}
