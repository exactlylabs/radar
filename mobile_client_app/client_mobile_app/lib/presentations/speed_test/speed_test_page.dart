import 'package:client_mobile_app/presentations/speed_test/steps/network_place_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/network_type_step.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/steps_indicator.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';

class SpeedTestPage extends StatelessWidget {
  const SpeedTestPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider<SpeedTestCubit>(
      create: (_) => SpeedTestCubit(),
      child: BlocBuilder<SpeedTestCubit, SpeedTestState>(
        builder: (context, state) {
          return SingleChildScrollView(
            child: Container(
              color: Theme.of(context).backgroundColor,
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 10.0),
                  if (state.step < 4)
                    StepIndicator(
                      totalSteps: 4,
                      currentStep: state.step,
                      textColor: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                      currentTextColor: Theme.of(context).colorScheme.onPrimary,
                      stepColor: Theme.of(context).colorScheme.primary.withOpacity(0.15),
                      currentStepColor: Theme.of(context).colorScheme.secondary,
                    ),
                  const SizedBox(height: 15.0),
                  if (state.step == 0)
                    LocationStep(
                      location: state.location,
                      locationError: state.locationError,
                      termsAccepted: state.termsAccepted,
                      termsError: state.termsError,
                    )
                  else if (state.step == 1)
                    NetworkPlaceStep(optionSelected: state.networkLocation)
                  else if (state.step == 2)
                    NetworkTypeStep(optionSelected: state.networkType),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
