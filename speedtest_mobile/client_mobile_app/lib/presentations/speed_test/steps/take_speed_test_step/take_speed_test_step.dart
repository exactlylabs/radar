import 'package:client_mobile_app/presentations/speed_test/widgets/permission_modals/manage_phone_calls_modal.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/test_results_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/testing_speed_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/start_speed_test_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_state.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/inherited_form_information.dart';

class TakeSpeedTestStep extends StatelessWidget {
  const TakeSpeedTestStep({
    Key? key,
    this.networkType,
    this.networkPlace,
    this.address,
    this.latitude,
    this.longitude,
  }) : super(key: key);

  final String? networkType;
  final String? networkPlace;
  final String? address;
  final double? latitude;
  final double? longitude;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: InheritedFormInformation(
          networkType: networkType,
          networkPlace: networkPlace,
          address: address,
          child: BlocListener<TakeSpeedTestStepCubit, TakeSpeedTestStepState>(
            listenWhen: (previous, current) =>
                (previous.isTestingUploadSpeed && !current.isTestingUploadSpeed) ||
                (!previous.requestPhonePermission && current.requestPhonePermission) ||
                current.finishedTesting,
            listener: (context, state) {
              if (state.requestPhonePermission) {
                openManagePhoneCallsModal(
                  context,
                  () => context.read<TakeSpeedTestStepCubit>().requestPhonePermission(),
                  () => context.read<TakeSpeedTestStepCubit>().startDownloadTest(),
                );
              }
              if (state.finishedTesting) {
                context.read<SpeedTestCubit>().saveResults(
                      state.downloadSpeed!,
                      state.uploadSpeed!,
                      state.latency!,
                      state.loss!,
                      state.networkQuality,
                      state.connectionInfo,
                      state.responses,
                      state.positionBeforeSpeedTest,
                      state.positionAfterSpeedTest,
                      state.deviceAndPermissionsState,
                    );
              }
            },
            child: BlocBuilder<TakeSpeedTestStepCubit, TakeSpeedTestStepState>(
              builder: (context, state) {
                if (state.isTestingDownloadSpeed || state.isTestingUploadSpeed) {
                  return TestingSpeedStep(
                    upload: state.uploadSpeed,
                    download: state.downloadSpeed,
                    loss: state.loss,
                    latency: state.latency,
                    isDownloadTest: state.isTestingDownloadSpeed,
                    progress: state.isTestingDownloadSpeed
                        ? state.downloadProgress
                        : state.uploadProgress,
                  );
                } else if (state.finishedTesting) {
                  return TestResultsStep(
                    download: state.downloadSpeed ?? 0,
                    upload: state.uploadSpeed ?? 0,
                    latency: state.latency ?? 0,
                    loss: state.loss ?? 0,
                    networkQuality: state.networkQuality,
                    latitude: latitude,
                    longitude: longitude,
                  );
                } else {
                  return const StartSpeedTestStep();
                }
              },
            ),
          ),
        ),
      ),
    );
  }
}
