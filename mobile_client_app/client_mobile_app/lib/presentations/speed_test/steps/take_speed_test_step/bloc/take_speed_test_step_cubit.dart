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

  void startDownloadTest() {
    emit(state.copyWith(isTestingDownloadSpeed: true));
    _ndt7client.startDownloadTest();
  }

  void startUploadTest() {
    emit(state.copyWith(isTestingUploadSpeed: true));
    _ndt7client.startUploadTest();
  }

  void _subscribeToNdt7Client() {
    _ndt7clientSubscription = _ndt7client.data.listen(
      (data) {
        if (data is ClientResponse) {
        } else if (data is ServerResponse) {}

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
}
