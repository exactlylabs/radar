import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
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
  Timer? _timer;

  void startDownloadTest() {
    emit(const TakeSpeedTestStepState(isTestingDownloadSpeed: true));
    _ndt7client.startDownloadTest();
  }

  void startUploadTest() {
    emit(state.copyWith(isTestingUploadSpeed: true));
    Timer(const Duration(seconds: 1), () {
      _ndt7client.startUploadTest();
    });
  }

  void _subscribeToNdt7Client() {
    _ndt7clientSubscription = _ndt7client.data.listen(
      (data) {
        if (_timer != null) {
          _timer!.cancel();
        }
        _timer = Timer(const Duration(seconds: 1), () {
          if (state.isTestingDownloadSpeed) {
            emit(state.copyWith(
              isTestingDownloadSpeed: false,
              latency: (state.minRtt ?? 0) / 1000,
              loss: (state.bytesRetrans ?? 0) / (state.bytesSent ?? 0) * 100,
            ));
            startUploadTest();
          } else if (state.isTestingUploadSpeed) {
            emit(state.copyWith(
              isTestingUploadSpeed: false,
              finishedTesting: true,
            ));
          }
        });
        if (data is ClientResponse) {
          final speed = convertToMbps(data.appInfo.elapsedTime, data.appInfo.numBytes);
          if (state.isTestingDownloadSpeed) {
            emit(state.copyWith(downloadSpeed: speed));
          } else if (state.isTestingUploadSpeed) {
            emit(state.copyWith(uploadSpeed: speed));
          }
        } else if (data is ServerResponse) {
          emit(
            state.copyWith(
              minRtt: data.tcpInfo.minRTT,
              bytesRetrans: data.tcpInfo.bytesRetrans,
              bytesSent: data.tcpInfo.bytesSent,
            ),
          );
        }

        if (state.isTestingDownloadSpeed) {
        } else if (state.isTestingUploadSpeed) {}
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
}
