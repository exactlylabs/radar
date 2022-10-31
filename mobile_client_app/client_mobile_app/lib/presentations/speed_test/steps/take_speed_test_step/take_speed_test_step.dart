import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_state.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/start_speed_test_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/test_results_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/testing_speed_step.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ndt7_client/ndt7_client.dart';

class TakeSpeedTestStep extends StatelessWidget {
  const TakeSpeedTestStep({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => TakeSpeedTestStepCubit(ndt7client: Ndt7Client()),
      child: BlocBuilder<TakeSpeedTestStepCubit, TakeSpeedTestStepState>(
        builder: (context, state) {
          if (state.isTestingDownloadSpeed || state.isTestingUploadSpeed) {
            return TestingSpeedStep();
          } else if (state.finishedTesting) {
            return TestResultsStep();
          } else
            return StartSpeedTestStep();
        },
      ),
    );
  }
}
